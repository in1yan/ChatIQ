"""ChromaDB vector service for storing and querying document embeddings."""

from __future__ import annotations

from pathlib import Path
from typing import Any
from uuid import uuid4

import chromadb
from chromadb.api.models.Collection import Collection
from pypdf import PdfReader

from app.core.config import settings


class ChromaVectorService:
    """Service for persisting PDF/text document embeddings in ChromaDB."""

    def __init__(self, persist_dir: str, collection_name: str) -> None:
        self._client = chromadb.PersistentClient(path=persist_dir)
        self._collection: Collection = self._client.get_or_create_collection(
            name=collection_name,
            metadata={"hnsw:space": "cosine"},
        )

    def _chunk_text(
        self,
        text: str,
        chunk_size: int = 1200,
        chunk_overlap: int = 200,
    ) -> list[str]:
        """Split text into overlapping chunks for more accurate retrieval."""
        cleaned = text.strip()
        if not cleaned:
            return []

        if len(cleaned) <= chunk_size:
            return [cleaned]

        chunks: list[str] = []
        start = 0
        step = max(1, chunk_size - chunk_overlap)
        while start < len(cleaned):
            end = start + chunk_size
            chunk = cleaned[start:end].strip()
            if chunk:
                chunks.append(chunk)
            start += step
        return chunks

    def _read_text_file(self, path: Path) -> str:
        return path.read_text(encoding="utf-8", errors="ignore")

    def _read_pdf_file(self, path: Path) -> str:
        reader = PdfReader(str(path))
        texts: list[str] = []
        for page in reader.pages:
            page_text = page.extract_text() or ""
            if page_text.strip():
                texts.append(page_text)
        return "\n".join(texts)

    def ingest_file(
        self,
        file_path: str,
        extra_metadata: dict[str, Any] | None = None,
    ) -> int:
        """Read a PDF or text file, chunk it, and store chunks in ChromaDB."""
        path = Path(file_path)
        if not path.exists() or not path.is_file():
            raise FileNotFoundError(f"File not found: {file_path}")

        suffix = path.suffix.lower()
        if suffix == ".pdf":
            text = self._read_pdf_file(path)
            file_type = "pdf"
        elif suffix in {".txt", ".md", ".text"}:
            text = self._read_text_file(path)
            file_type = "text"
        else:
            raise ValueError(
                "Unsupported file type. Supported extensions are: .pdf, .txt, .md, .text"
            )

        chunks = self._chunk_text(text)
        if not chunks:
            return 0

        documents: list[str] = []
        metadatas: list[dict[str, Any]] = []
        ids: list[str] = []

        base_metadata = {
            "file_name": path.name,
            "file_path": str(path.resolve()),
            "file_type": file_type,
        }
        if extra_metadata:
            for key, value in extra_metadata.items():
                base_metadata[str(key)] = str(value)

        for chunk_index, chunk in enumerate(chunks):
            ids.append(str(uuid4()))
            documents.append(chunk)
            chunk_metadata = dict(base_metadata)
            chunk_metadata["chunk_index"] = chunk_index
            metadatas.append(chunk_metadata)

        if not documents:
            return 0

        self._collection.add(documents=documents, metadatas=metadatas, ids=ids)
        return len(documents)

    def search_documents(
        self,
        query_text: str,
        n_results: int = 5,
    ) -> dict[str, Any]:
        """Search similar chunks from ingested files."""
        return self._collection.query(
            query_texts=[query_text],
            n_results=n_results,
        )

    def delete_documents(self, file_name: str | None = None) -> None:
        """Delete documents matching the file name."""
        if file_name:
            where_filter = {"file_name": file_name}
            self._collection.delete(where=where_filter)

    def list_documents(self) -> list[dict[str, Any]]:
        """Return unique document metadata from the collection."""
        results = self._collection.get(
            include=["metadatas"],
        )
        
        # Extract unique documents by file_name
        seen = set()
        docs = []
        for metadata in (results.get("metadatas") or []):
            file_name = metadata.get("file_name")
            if file_name not in seen:
                seen.add(file_name)
                docs.append({
                    "file_name": file_name,
                    "file_type": metadata.get("file_type"),
                    "file_path": metadata.get("file_path"),
                })
        return docs


_chroma_service: ChromaVectorService | None = None


def get_chroma_service() -> ChromaVectorService:
    """Return singleton ChromaDB vector service instance."""
    global _chroma_service
    if _chroma_service is None:
        _chroma_service = ChromaVectorService(
            persist_dir=settings.CHROMA_PERSIST_DIR,
            collection_name=settings.CHROMA_COLLECTION_NAME,
        )
    return _chroma_service
