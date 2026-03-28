from typing import List, Optional
from pydantic import BaseModel, Field

class KnowledgeDocument(BaseModel):
    """Metadata about a document in the knowledge base."""
    file_name: str
    file_type: Optional[str] = None
    file_path: Optional[str] = None

class SearchResult(BaseModel):
    """A search result containing document chunk and metadata."""
    content: str = Field(description="The chunk of text from the document")
    file_name: str = Field(description="Name of the source file")
    file_type: Optional[str] = None
    file_path: Optional[str] = None
    chunk_index: Optional[int] = None

class KnowledgeIngestResponse(BaseModel):
    """Response after ingesting a document."""
    file_name: str
    chunks_count: int
    message: str

class KnowledgeDeleteResponse(BaseModel):
    """Response after deleting documents."""
    file_name: Optional[str] = None
    message: str

class KnowledgeListResponse(BaseModel):
    """Response containing a list of documents."""
    documents: List[KnowledgeDocument]

class KnowledgeSearchResponse(BaseModel):
    """Response containing search results."""
    query: str
    results: List[SearchResult]
    count: int
