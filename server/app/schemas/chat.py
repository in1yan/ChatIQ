from typing import Literal, Optional

from pydantic import BaseModel, EmailStr, Field


class ChatRequest(BaseModel):
    prompt: str = Field(..., min_length=1, description="The user's message/prompt")
    phone_number: Optional[str] = Field(
        None,
        max_length=20,
        description="Customer phone number (for WhatsApp/Telegram)",
    )
    email: Optional[EmailStr] = Field(
        None, description="Customer email address (for email channel)"
    )
    channel: Literal["whatsapp", "telegram", "email"] = Field(
        ..., description="The channel this message came from"
    )
    customer_name: Optional[str] = Field(
        None, max_length=255, description="Customer's full name (optional)"
    )
    telegram_username: Optional[str] = Field(
        None, max_length=255, description="Telegram username (optional)"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "prompt": "Hello, I need help with my order",
                "phone_number": "+1234567890",
                "channel": "whatsapp",
                "customer_name": "John Doe",
            }
        }


class ChatMessage(BaseModel):
    role: Literal["user", "model"]
    timestamp: str
    content: str


class CustomerResponse(BaseModel):
    id: int
    phone_number: Optional[str]
    email: Optional[str]
    telegram_username: Optional[str]
    channel: str
    full_name: Optional[str]
    created_at: str
