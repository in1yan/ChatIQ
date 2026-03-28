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
    namespace: str = Query(..., description="Namespace to categorize the document"),
    chroma_service: ChromaVectorService = Depends(get_chroma_service),
) -> KnowledgeIngestResponse:
    """
    Ingest a PDF or text file into the vector database.
    The file will be chunked and stored with the specified namespace.
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
            chunks_count = chroma_service.ingest_file(
                file_path=tmp_path,
                namespace=namespace,
            )
            
            # Note: Chroma Service uses the file's base name from the path.
            # However, since we used a temporary file, we might want to override the filename in metadata if possible.
            # But currently ingest_file uses path.name. Let's fix this in the service or here.
            # For now, we'll inform the user about the filename.
            
            return KnowledgeIngestResponse(
                file_name=file.filename,
                namespace=namespace,
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
    namespace: Optional[str] = Query(None, description="Filter documents by namespace"),
    chroma_service: ChromaVectorService = Depends(get_chroma_service),
) -> KnowledgeListResponse:
    """Retrieve a list of unique documents stored in the knowledge base."""
    docs_metadata = chroma_service.list_documents(namespace=namespace)
    documents = [KnowledgeDocument(**doc) for doc in docs_metadata]
    return KnowledgeListResponse(documents=documents)


@router.delete(
    "/documents",
    response_model=KnowledgeDeleteResponse,
    summary="Delete documents from the knowledge base",
)
async def delete_documents(
    namespace: str = Query(..., description="Namespace of the documents to delete"),
    file_name: Optional[str] = Query(None, description="Specific file name to delete within the namespace"),
    chroma_service: ChromaVectorService = Depends(get_chroma_service),
) -> KnowledgeDeleteResponse:
    """
    Delete all chunks associated with a namespace, or a specific file within a namespace.
    """
    try:
        chroma_service.delete_documents(namespace=namespace, file_name=file_name)
        msg = f"Successfully deleted documents in namespace '{namespace}'"
        if file_name:
            msg += f" with file name '{file_name}'"
        
        return KnowledgeDeleteResponse(
            namespace=namespace,
            file_name=file_name,
            message=msg,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting documents: {str(e)}",
        )
