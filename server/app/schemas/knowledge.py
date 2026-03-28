from typing import List, Optional
from pydantic import BaseModel, Field

class KnowledgeDocument(BaseModel):
    """Metadata about a document in the knowledge base."""
    file_name: str
    namespace: str
    file_type: Optional[str] = None
    file_path: Optional[str] = None

class KnowledgeIngestResponse(BaseModel):
    """Response after ingesting a document."""
    file_name: str
    namespace: str
    chunks_count: int
    message: str

class KnowledgeDeleteResponse(BaseModel):
    """Response after deleting documents."""
    namespace: str
    file_name: Optional[str] = None
    message: str

class KnowledgeListResponse(BaseModel):
    """Response containing a list of documents."""
    documents: List[KnowledgeDocument]
