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
    role: Literal["user", "model", "agent"]
    timestamp: str
    content: str

class AdminReplyRequest(BaseModel):
    message: str = Field(..., min_length=1)


from datetime import datetime

class CustomerResponse(BaseModel):
    id: int
    phone_number: Optional[str]
    email: Optional[str]
    telegram_username: Optional[str]
    channel: str
    full_name: Optional[str]
    profile_picture_url: Optional[str]
    ai_paused: bool = False
    created_at: datetime


class ChatResponse(BaseModel):
    """Response from the chat endpoint."""

    user_message: ChatMessage
    ai_response: ChatMessage
    customer_id: int

    class Config:
        json_schema_extra = {
            "example": {
                "user_message": {
                    "role": "user",
                    "timestamp": "2024-03-27T12:00:00Z",
                    "content": "Hello, I need help",
                },
                "ai_response": {
                    "role": "model",
                    "timestamp": "2024-03-27T12:00:01Z",
                    "content": "Hello! I'm here to help. What do you need?",
                },
                "customer_id": 123,
            }
        }


class SendMessageRequest(BaseModel):
    """Request to send a direct message to a customer."""

    customer_id: int = Field(..., description="Customer ID to send message to")
    message: str = Field(..., min_length=1, max_length=4096, description="Message content")
    channel: Literal["whatsapp", "telegram"] = Field(
        ..., description="Target channel (whatsapp or telegram)"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "customer_id": 123,
                "message": "Your order has been shipped!",
                "channel": "whatsapp",
            }
        }


class SendMessageResponse(BaseModel):
    """Response from sending a direct message."""

    success: bool = Field(..., description="Whether the message was sent successfully")
    message_id: Optional[str] = Field(
        None, description="Message ID from the channel (if available)"
    )
    timestamp: str = Field(..., description="ISO timestamp of when message was sent")
    channel: str = Field(..., description="Channel the message was sent to")
    customer_id: int = Field(..., description="Customer ID message was sent to")

    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "message_id": "wamid.xxxx=",
                "timestamp": "2024-03-27T12:00:00Z",
                "channel": "whatsapp",
                "customer_id": 123,
            }
        }
