"""
Agent service module for AI-powered customer chat.
Provides business logic functions for customer management and chat streaming.
"""

from __future__ import annotations as _annotations

import json
from datetime import datetime, timezone
from typing import AsyncIterator, Literal

from pydantic_ai import (
    Agent,
    ModelMessage,
    ModelMessagesTypeAdapter,
    ModelRequest,
    ModelResponse,
    TextPart,
    UnexpectedModelBehavior,
    UserPromptPart,
)
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Customer, Message

# Global agent instance (lazy initialization)
_agent: Agent | None = None


def get_agent() -> Agent:
    """Get or create the AI agent instance."""
    global _agent
    if _agent is None:
        # Initialize the AI agent with OpenAI GPT-5.2
        # Make sure OPENAI_API_KEY is set in environment
        _agent = Agent("openai:gpt-5.2")
    return _agent


class ChatMessage(dict):
    """Format of messages sent to the client."""

    role: Literal["user", "model"]
    timestamp: str
    content: str


def to_chat_message(m: ModelMessage) -> ChatMessage:
    """Convert Pydantic AI ModelMessage to ChatMessage format."""
    first_part = m.parts[0]
    if isinstance(m, ModelRequest):
        if isinstance(first_part, UserPromptPart):
            assert isinstance(first_part.content, str)
            return ChatMessage(
                {
                    "role": "user",
                    "timestamp": first_part.timestamp.isoformat(),
                    "content": first_part.content,
                }
            )
    elif isinstance(m, ModelResponse):
        if isinstance(first_part, TextPart):
            return ChatMessage(
                {
                    "role": "model",
                    "timestamp": m.timestamp.isoformat(),
                    "content": first_part.content,
                }
            )
    raise UnexpectedModelBehavior(f"Unexpected message type for chat app: {m}")


async def get_or_create_customer(
    db: AsyncSession,
    phone: str | None,
    email: str | None,
    channel: str,
    **metadata,
) -> Customer:
    """
    Get existing customer or create a new one based on phone/email identifier.

    Args:
        db: Database session
        phone: Customer phone number (for WhatsApp/Telegram)
        email: Customer email (for email channel)
        channel: Communication channel (whatsapp, telegram, email)
        **metadata: Additional customer data (full_name, telegram_username, etc.)

    Returns:
        Customer object (existing or newly created)
    """
    # Find existing customer
    query = select(Customer)
    if phone:
        query = query.where(Customer.phone_number == phone)
    elif email:
        query = query.where(Customer.email == email)
    else:
        raise ValueError("Either phone_number or email must be provided")

    result = await db.execute(query)
    existing_customer = result.scalar_one_or_none()

    if existing_customer:
        return existing_customer

    # Create new customer
    customer = Customer(
        phone_number=phone,
        email=email,
        channel=channel,
        full_name=metadata.get("full_name"),
        telegram_username=metadata.get("telegram_username"),
        extra_data=metadata,
    )

    try:
        db.add(customer)
        await db.commit()
        await db.refresh(customer)
        return customer
    except IntegrityError:
        # Handle race condition - customer was created by another request
        await db.rollback()
        result = await db.execute(query)
        return result.scalar_one()


async def get_customer_messages(
    db: AsyncSession, customer_id: int
) -> list[ModelMessage]:
    """
    Retrieve all messages for a specific customer.

    Args:
        db: Database session
        customer_id: Customer ID

    Returns:
        List of Pydantic AI ModelMessage objects
    """
    result = await db.execute(
        select(Message)
        .where(Message.customer_id == customer_id)
        .order_by(Message.id)
    )
    rows = result.scalars().all()

    messages: list[ModelMessage] = []
    for row in rows:
        # message_data is stored as JSONB, validate and convert to ModelMessage
        messages.extend(ModelMessagesTypeAdapter.validate_python(row.message_data))
    return messages


async def save_messages(
    db: AsyncSession, customer_id: int, messages: bytes
) -> None:
    """
    Save new messages for a customer.

    Args:
        db: Database session
        customer_id: Customer ID
        messages: JSON bytes containing Pydantic AI message data
    """
    message = Message(
        customer_id=customer_id,
        message_data=json.loads(messages),  # Store as dict for JSONB
    )
    db.add(message)
    await db.commit()


async def stream_chat_response(
    prompt: str, customer_id: int, db: AsyncSession
) -> AsyncIterator[bytes]:
    """
    Stream chat response from the AI agent.

    Args:
        prompt: User's message/prompt
        customer_id: Customer ID for message history
        db: Database session

    Yields:
        JSON-encoded chat messages as bytes (newline-delimited)
    """
    # Stream the user prompt so it can be displayed immediately
    yield (
        json.dumps(
            {
                "role": "user",
                "timestamp": datetime.now(tz=timezone.utc).isoformat(),
                "content": prompt,
            }
        ).encode("utf-8")
        + b"\n"
    )

    # Get chat history for context
    messages = await get_customer_messages(db, customer_id)

    # Get the agent instance
    agent = get_agent()

    # Run the agent with user prompt and chat history
    async with agent.run_stream(prompt, message_history=messages) as result:
        async for text in result.stream_output(debounce_by=0.01):
            # text is a str, convert to ChatMessage format
            m = ModelResponse(parts=[TextPart(text)], timestamp=result.timestamp())
            yield json.dumps(to_chat_message(m)).encode("utf-8") + b"\n"

    # Save new messages to database
    await save_messages(db, customer_id, result.new_messages_json())

