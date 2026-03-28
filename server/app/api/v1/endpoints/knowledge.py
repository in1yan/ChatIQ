import os
import shutil
import tempfile
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, status
from fastapi.responses import JSONResponse

from app.schemas.knowledge import (
    KnowledgeDeleteResponse,
    KnowledgeDocument,
    KnowledgeIngestResponse,
    KnowledgeListResponse,
    KnowledgeSearchResponse,
    SearchResult,
)
from app.services.chroma.service import ChromaVectorService, get_chroma_service

router = APIRouter()


@router.post(
    "/ingest",
    response_model=KnowledgeIngestResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Ingest a document into the knowledge base",
)
async def ingest_document(
    file: UploadFile,
    chroma_service: ChromaVectorService = Depends(get_chroma_service),
) -> KnowledgeIngestResponse:
    """
    Ingest a PDF or text file into the vector database.
    The file will be chunked and stored in the knowledge base.
    """
    # Create a temporary file to store the uploaded content
    suffix = os.path.splitext(file.filename)[1].lower()
    if suffix not in {".pdf", ".txt", ".md", ".text"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type: {suffix}. Supported: .pdf, .txt, .md, .text",
        )

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = tmp.name

        try:
            # Ingest the file using Chroma service
            chunks_count = chroma_service.ingest_file(file_path=tmp_path)
            
            return KnowledgeIngestResponse(
                file_name=file.filename,
                chunks_count=chunks_count,
                message=f"Successfully ingested {file.filename} with {chunks_count} chunks.",
            )
        finally:
            # Clean up temporary file
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_MODEL,
            detail=f"Error ingesting document: {str(e)}",
        )


@router.get(
    "/documents",
    response_model=KnowledgeListResponse,
    summary="List documents in the knowledge base",
)
async def list_documents(
    chroma_service: ChromaVectorService = Depends(get_chroma_service),
) -> KnowledgeListResponse:
    """Retrieve a list of unique documents stored in the knowledge base."""
    docs_metadata = chroma_service.list_documents()
    documents = [KnowledgeDocument(**doc) for doc in docs_metadata]
    return KnowledgeListResponse(documents=documents)


@router.get(
    "/search",
    response_model=KnowledgeSearchResponse,
    summary="Search the knowledge base",
)
async def search_knowledge(
    query: str = Query(..., description="Search query text", min_length=1),
    n_results: int = Query(5, description="Maximum number of results to return", ge=1, le=50),
    chroma_service: ChromaVectorService = Depends(get_chroma_service),
) -> KnowledgeSearchResponse:
    """
    Search the knowledge base for relevant document chunks.
    Returns the most similar chunks based on semantic similarity.
    """
    try:
        search_results = chroma_service.search_documents(query_text=query, n_results=n_results)
        
        results: List[SearchResult] = []
        documents = search_results.get("documents", [])
        metadatas = search_results.get("metadatas", [])
        
        if documents and len(documents) > 0:
            for doc_list, metadata_list in zip(documents, metadatas):
                for doc, metadata in zip(doc_list, metadata_list):
                    if doc and doc.strip():
                        results.append(
                            SearchResult(
                                content=doc,
                                file_name=metadata.get("file_name", "unknown"),
                                file_type=metadata.get("file_type"),
                                file_path=metadata.get("file_path"),
                                chunk_index=metadata.get("chunk_index"),
                            )
                        )
        
        return KnowledgeSearchResponse(
            query=query,
            results=results,
            count=len(results),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error searching knowledge base: {str(e)}",
        )


@router.delete(
    "/documents",
    response_model=KnowledgeDeleteResponse,
    summary="Delete documents from the knowledge base",
)
async def delete_documents(
    file_name: Optional[str] = Query(None, description="File name to delete"),
    chroma_service: ChromaVectorService = Depends(get_chroma_service),
) -> KnowledgeDeleteResponse:
    """
    Delete documents from the knowledge base.
    If file_name is provided, only that file will be deleted.
    If no file_name is provided, all documents will be deleted.
    """
    try:
        chroma_service.delete_documents(file_name=file_name)
        if file_name:
            msg = f"Successfully deleted documents with file name '{file_name}'"
        else:
            msg = "Successfully deleted all documents"
        
        return KnowledgeDeleteResponse(
            file_name=file_name,
            message=msg,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting documents: {str(e)}",
        )
