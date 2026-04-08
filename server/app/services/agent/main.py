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
    RunContext,
    TextPart,
    UnexpectedModelBehavior,
    UserPromptPart,
)
from pydantic_ai.models.groq import GroqModel
from pydantic_ai.providers.groq import GroqProvider
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models import Customer, Message

# Global agent instance (lazy initialization)
_agent: Agent | None = None
model = "openai/gpt-oss-20b"


def get_agent() -> Agent:
    """Get or create the AI agent instance."""
    global _agent
    if _agent is None:
        # Initialize the AI agent with OpenAI GPT-5.2
        # Make sure OPENAI_API_KEY is set in environment
        gm = GroqModel(model, provider=GroqProvider(api_key=settings.GROQ_API_KEY))

        system_prompt = (
            "You are a helpful customer support assistant for ChatIQ. "
            "You will hold full conversation with customers convincing them to buy products or resolve issues. "
            "Always generate response in plain text don't use markdown. "
            "IMPORTANT: Use the 'search_knowledge_base' tool whenever a customer asks for specific information "
            "that you don't know, such as product details, discount codes, or company policies. "
            "Do NOT make up information. If the information is not in the knowledge base, say so. "
            "During the conversation, immediately use 'log_message_insight' when you detect upsell opportunities, service gaps, or strong sentiments. "
            "At the end of the conversation, use 'log_conversation_insight' to summarize the overall metrics like churn risk, customer segments, trending topics, and aspect based sentiments."
        )

        _agent = Agent(model=gm, system_prompt=system_prompt)

        @_agent.system_prompt
        async def add_custom_instructions(ctx: RunContext[dict]) -> str:
            """Append custom instructions from the database."""
            db = ctx.deps["db"]
            from sqlalchemy import select

            from app.models.agent_configs import AgentConfig

            result = await db.execute(
                select(AgentConfig).order_by(AgentConfig.id.desc()).limit(1)
            )
            config = result.scalar_one_or_none()

            if config and config.custom_instructions:
                instructions_text = "\n".join(
                    f"- {inst}" for inst in config.custom_instructions
                )
                return f"### Additional Custom Instructions ###\n{instructions_text}\n"
            return ""

        @_agent.tool_plain
        async def search_knowledge_base(query: str) -> str:
            """
            Search the internal knowledge base for details to answer customer questions.
            Args:
                query: The search terms or question to look up.
            """
            from app.services.chroma.service import get_chroma_service

            try:
                chroma_service = get_chroma_service()
                results = chroma_service.search_documents(query)

                # documents is a list of lists: [[doc1, doc2, ...]]
                documents = results.get("documents", [])
                if not documents or not documents[0]:
                    return "No relevant information found in the knowledge base."

                # Flatten the list of documents
                flat_docs = []
                for doc_list in documents:
                    for doc in doc_list:
                        if doc and doc.strip():
                            flat_docs.append(doc)

                if not flat_docs:
                    return "No relevant information found in the knowledge base."

                # Combine top result snippets
                context = "\n---\n".join(flat_docs[:5])
                return f"Relevant information from knowledge base:\n\n{context}"
            except Exception as e:
                return f"Error searching knowledge base: {str(e)}"

        @_agent.tool
        async def log_message_insight(
            ctx: RunContext[dict],
            per_message_sentiment: str,
            upsell_opportunity: str | None = None,
            service_gap: str | None = None,
        ) -> str:
            """
            Log insights for the current message or recent exchange.
            Call this DURING the conversation when you detect sentiments, upsell opportunities, or service gaps.
            """
            from app.models.insights import Insight

            db = ctx.deps["db"]
            customer_id = ctx.deps["customer_id"]

            insight = Insight(
                customer_id=customer_id,
                insight_type="message_level",
                per_message_sentiment=per_message_sentiment,
                upsell_opportunity=upsell_opportunity,
                service_gap=service_gap,
            )
            db.add(insight)
            await db.commit()
            return "Message insight logged successfully."

        @_agent.tool
        async def log_conversation_insight(
            ctx: RunContext[dict],
            conversation_sentiment: str,
            channel_sentiment_trend: str,
            churn_risk: str,
            customer_segment_lead_score: str,
            aspect_based_sentiment: dict,
            trending_topics: list[str],
            traffic_rate: str | None = None,
            traffic_to_conversion_rate: str | None = None,
        ) -> str:
            """
            Log insights for the entire conversation.
            Call this at the END of the conversation to provide overall metrics.
            """
            from app.models.insights import Insight

            db = ctx.deps["db"]
            customer_id = ctx.deps["customer_id"]

            insight = Insight(
                customer_id=customer_id,
                insight_type="conversation_level",
                conversation_sentiment=conversation_sentiment,
                channel_sentiment_trend=channel_sentiment_trend,
                churn_risk=churn_risk,
                customer_segment_lead_score=customer_segment_lead_score,
                aspect_based_sentiment=aspect_based_sentiment,
                trending_topics=trending_topics,
                traffic_rate=traffic_rate,
                traffic_to_conversion_rate=traffic_to_conversion_rate,
            )
            db.add(insight)
            await db.commit()
            return "Conversation insight logged successfully."

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
    phone: str | None = None,
    email: str | None = None,
    telegram_user_id: str | None = None,
    channel: str = "",
    chat_id: str | None = None,
    **metadata,
) -> Customer:
    """
    Get existing customer or create a new one based on identifier.

    Args:
        db: Database session
        phone: Customer phone number (for WhatsApp/Telegram)
        email: Customer email (for email channel)
        telegram_user_id: Telegram user ID (for Telegram channel)
        channel: Communication channel (whatsapp, telegram, email)
        chat_id: WhatsApp chat ID (for profile picture fetching)
        **metadata: Additional customer data (full_name, telegram_username, etc.)

    Returns:
        Customer object (existing or newly created)
    """
    # Find existing customer based on available identifier
    query = select(Customer)
    if telegram_user_id:
        query = query.where(Customer.telegram_user_id == telegram_user_id)
    elif phone:
        query = query.where(Customer.phone_number == phone)
    elif email:
        query = query.where(Customer.email == email)
    else:
        raise ValueError(
            "At least one identifier must be provided: phone, email, or telegram_user_id"
        )

    result = await db.execute(query)
    existing_customer = result.scalar_one_or_none()

    if existing_customer:
        # Update full_name if provided and different
        full_name = metadata.get("full_name")
        if full_name and existing_customer.full_name != full_name:
            existing_customer.full_name = full_name
            await db.commit()
            await db.refresh(existing_customer)
        return existing_customer

    # Fetch profile picture based on channel (only on creation)
    profile_picture_url = None

    if channel == "whatsapp" and chat_id:
        from app.services.whatsapp.whatsapp import get_profile_picture

        profile_picture_url = await get_profile_picture(chat_id)

    elif channel == "telegram" and telegram_user_id:
        from app.services.telegram.webhook import get_telegram_profile_picture

        try:
            user_id_int = int(telegram_user_id)
            profile_picture_url = await get_telegram_profile_picture(user_id_int)
        except ValueError:
            pass  # Invalid telegram_user_id, skip profile picture

    # Create new customer
    customer = Customer(
        phone_number=phone,
        email=email,
        telegram_user_id=telegram_user_id,
        channel=channel,
        full_name=metadata.get("full_name"),
        telegram_username=metadata.get("telegram_username"),
        profile_picture_url=profile_picture_url,
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
        select(Message).where(Message.customer_id == customer_id).order_by(Message.id)
    )
    rows = result.scalars().all()

    messages: list[ModelMessage] = []
    for row in rows:
        # message_data is stored as JSONB, validate and convert to ModelMessage
        messages.extend(ModelMessagesTypeAdapter.validate_python(row.message_data))
    return messages


from sqlalchemy import update
from sqlalchemy.sql import func


async def save_messages(db: AsyncSession, customer_id: int, messages: bytes) -> None:
    """
    Save new messages for a customer and bump their updated_at timestamp.
    """
    message = Message(
        customer_id=customer_id,
        message_data=json.loads(messages),  # Store as dict for JSONB
    )
    db.add(message)
    await db.execute(
        update(Customer).where(Customer.id == customer_id).values(updated_at=func.now())
    )
    await db.commit()


async def save_manual_user_message(
    db: AsyncSession, customer_id: int, content: str
) -> None:
    m = ModelRequest(
        parts=[UserPromptPart(content=content, timestamp=datetime.now(timezone.utc))]
    )
    msg_data = ModelMessagesTypeAdapter.dump_json([m])
    await save_messages(db, customer_id, msg_data)


async def save_manual_agent_message(
    db: AsyncSession, customer_id: int, content: str
) -> None:
    m = ModelResponse(
        parts=[TextPart(content=f"[AGENT] {content}")],
        timestamp=datetime.now(timezone.utc),
    )
    msg_data = ModelMessagesTypeAdapter.dump_json([m])
    await save_messages(db, customer_id, msg_data)


async def get_chat_response(prompt: str, customer_id: int, db: AsyncSession) -> dict:
    """
    Get complete chat response from the AI agent (non-streaming).

    Args:
        prompt: User's message/prompt
        customer_id: Customer ID for message history
        db: Database session

    Returns:
        Dictionary with user message and AI response
    """
    # Get chat history for context
    messages = await get_customer_messages(db, customer_id)

    # Truncate history to prevent token limits (Groq TPM limit)
    # Keep up to 10 recent messages, ensuring the oldest is a UserPrompt
    if len(messages) > 10:
        messages = messages[-10:]
        while messages:
            first = messages[0]
            if (
                isinstance(first, ModelRequest)
                and first.parts
                and isinstance(first.parts[0], UserPromptPart)
            ):
                break
            messages.pop(0)

    # Get the agent instance
    agent = get_agent()

    # Run the agent and wait for complete response
    deps = {"db": db, "customer_id": customer_id}
    result = await agent.run(prompt, message_history=messages, deps=deps)

    # Save new messages to database
    await save_messages(db, customer_id, result.new_messages_json())

    # Return structured response
    return {
        "user_message": {
            "role": "user",
            "timestamp": datetime.now(tz=timezone.utc).isoformat(),
            "content": prompt,
        },
        "ai_response": {
            "role": "model",
            "timestamp": result.timestamp().isoformat(),
            "content": result.output,
        },
        "customer_id": customer_id,
    }


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

    # Truncate history to prevent token limits (Groq TPM limit)
    if len(messages) > 10:
        messages = messages[-10:]
        while messages:
            first = messages[0]
            if (
                isinstance(first, ModelRequest)
                and first.parts
                and isinstance(first.parts[0], UserPromptPart)
            ):
                break
            messages.pop(0)

    # Get the agent instance
    agent = get_agent()

    # Run the agent with user prompt and chat history
    deps = {"db": db, "customer_id": customer_id}
    async with agent.run_stream(prompt, message_history=messages, deps=deps) as result:
        async for text in result.stream_output(debounce_by=0.01):
            # text is a str, convert to ChatMessage format
            m = ModelResponse(parts=[TextPart(text)], timestamp=result.timestamp())
            yield json.dumps(to_chat_message(m)).encode("utf-8") + b"\n"

    # Save new messages to database
    await save_messages(db, customer_id, result.new_messages_json())


async def send_direct_message(db: AsyncSession, customer_id: int, message: str) -> dict:
    """
    Send a direct message to a customer via their preferred channel.

    This is for human-written messages, not AI-generated responses.
    Does NOT require chat history or AI processing.

    Args:
        db: Database session
        customer_id: Customer ID to send message to
        message: Message text to send

    Returns:
        Dictionary with message delivery metadata:
        {
            "success": bool,
            "message_id": str or None,
            "timestamp": str (ISO format),
            "channel": str,
            "customer_id": int
        }

    Raises:
        ValueError: If customer not found or channel not supported
    """
    # Get the customer
    result = await db.execute(select(Customer).where(Customer.id == customer_id))
    customer = result.scalar_one_or_none()

    if not customer:
        raise ValueError(f"Customer with ID {customer_id} not found")

    channel = customer.channel
    timestamp = datetime.now(tz=timezone.utc).isoformat()

    try:
        if channel == "whatsapp":
            # Send via WhatsApp
            from app.services.whatsapp.whatsapp import send_whatsapp_message

            # For WhatsApp, we need the chat_id format (phone@c.us)
            # Try to construct it from phone_number
            if not customer.phone_number:
                raise ValueError(
                    f"Customer {customer_id} has no phone number for WhatsApp"
                )

            # Normalize phone number to WhatsApp format (phone@c.us)
            phone = (
                customer.phone_number.replace("+", "").replace(" ", "").replace("-", "")
            )
            chat_id = f"{phone}@lid"

            response = await send_whatsapp_message(chat_id, message)

            # Extract message ID from WAHA API response
            # Handle different response formats
            message_id = None
            if isinstance(response, dict):
                # Try common locations for message ID in WAHA response
                message_id = response.get("message", {}).get("id") or response.get("id")

            return {
                "success": True,
                "message_id": message_id,
                "timestamp": timestamp,
                "channel": "whatsapp",
                "customer_id": customer_id,
            }

        elif channel == "telegram":
            # Send via Telegram
            from app.services.telegram.webhook import send_telegram_message

            if not customer.telegram_user_id:
                raise ValueError(
                    f"Customer {customer_id} has no telegram_user_id for Telegram"
                )

            try:
                chat_id = int(customer.telegram_user_id)
            except (ValueError, TypeError):
                raise ValueError(
                    f"Invalid telegram_user_id for customer {customer_id}: {customer.telegram_user_id}"
                )

            response = await send_telegram_message(chat_id, message)

            return {
                "success": True,
                "message_id": str(response.get("message_id"))
                if response.get("message_id")
                else None,
                "timestamp": response.get("date", timestamp),
                "channel": "telegram",
                "customer_id": customer_id,
            }

        else:
            raise ValueError(f"Unsupported channel: {channel}")

    except Exception as e:
        raise ValueError(f"Failed to send message via {channel}: {str(e)}")
