"""
Chat endpoints for multi-channel customer support.
Handles WhatsApp, Telegram, and Email customer interactions with AI agent.
"""

import json

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse, Response
from sqlalchemy.ext.asyncio import AsyncSession

from sqlalchemy import select, desc
from app.models import Customer, Message
from app.db.session import get_db
from app.schemas.chat import AdminReplyRequest, ChatMessage, ChatRequest, ChatResponse, CustomerResponse
from app.services.agent.main import (
    get_chat_response,
    get_or_create_customer,
    save_manual_agent_message,
)
from app.services.telegram.webhook import send_telegram_message
from app.services.whatsapp.whatsapp import send_whatsapp_message

router = APIRouter()


@router.post(
    "/",
    status_code=status.HTTP_200_OK,
    summary="Send message to AI agent",
    response_description="Complete chat response",
    response_model=ChatResponse,
)
async def send_message(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db),
) -> ChatResponse:
    """
    Send a message to the AI agent and receive complete response.

    Automatically creates a new customer if they don't exist based on:
    - Phone number (for WhatsApp/Telegram)
    - Email (for email channel)

    Args:
        request: Chat request with prompt, identifier, and channel info
        db: Database session

    Returns:
        JSON response with user message and AI response
    """
    # Validate that we have an identifier
    if not request.phone_number and not request.email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either phone_number or email must be provided",
        )

    # Get or create customer
    customer = await get_or_create_customer(
        db=db,
        phone=request.phone_number,
        email=request.email,
        channel=request.channel,
        full_name=request.customer_name,
        telegram_username=request.telegram_username,
    )

    # Get complete chat response
    response_data = await get_chat_response(request.prompt, customer.id, db)

    # Return response with headers
    return ChatResponse(**response_data)


@router.get(
    "/{customer_id}",
    status_code=status.HTTP_200_OK,
    summary="Get customer chat history",
    response_description="Customer's chat history",
)
async def get_chat_history(
    customer_id: int,
    db: AsyncSession = Depends(get_db),
) -> Response:
    limit_query = select(Message.message_data).where(Message.customer_id == customer_id).order_by(Message.id)
    result = await db.execute(limit_query)
    rows = result.scalars().all()
    
    chat_messages = []
    for message_data_list in rows:
        if not isinstance(message_data_list, list):
            continue
        for msg in message_data_list:
            role = "unknown"
            content = ""
            timestamp = msg.get("timestamp", "")
            
            m_type = msg.get("type", msg.get("kind"))
            parts = msg.get("parts", [])
            
            if m_type == "request":
                role = "user"
                for p in parts:
                    pk = p.get("part_kind", p.get("type"))
                    if pk in ("user-prompt", "text", "user"):
                        content += p.get("content", "")
            elif m_type in ("model-response", "response"):
                role = "model"
                for p in parts:
                    pk = p.get("part_kind", p.get("type"))
                    if pk in ("text", "model"):
                        content += p.get("content", "")
            
            if role != "unknown" and content:
                chat_messages.append({"role": role, "timestamp": timestamp, "content": content})

    return Response(
        b"\n".join(json.dumps(m).encode("utf-8") for m in chat_messages),
        media_type="text/plain",
    )


@router.get(
    "/customers/all",
    status_code=status.HTTP_200_OK,
    summary="Get all customers",
    response_model=list[CustomerResponse],
)
async def list_customers(db: AsyncSession = Depends(get_db)):
    """Fetch all customers from the DB for the CRM sidebar."""
    query = select(Customer).order_by(desc(Customer.updated_at))
    result = await db.execute(query)
    customers = result.scalars().all()
    # Ensure ai_paused doesn't crash if null temporarily
    for c in customers:
        if c.ai_paused is None:
            c.ai_paused = False
    return customers


@router.post(
    "/{customer_id}/toggle-ai",
    status_code=status.HTTP_200_OK,
    summary="Toggle AI auto-reply",
)
async def toggle_ai(
    customer_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Enable or disable the AI proxy for a specific customer."""
    customer = await db.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
        
    customer.ai_paused = not customer.ai_paused
    await db.commit()
    return {"status": "success", "ai_paused": customer.ai_paused}


@router.post(
    "/{customer_id}/reply",
    status_code=status.HTTP_200_OK,
    summary="Human agent reply",
)
async def agent_reply(
    customer_id: int,
    request: AdminReplyRequest,
    db: AsyncSession = Depends(get_db)
):
    """Dispatch a response to the customer via their channel directly from the CRM UI."""
    customer = await db.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    # Send the physical outbound request via channel API
    channel_status = "sent"
    if customer.channel == "whatsapp" and customer.phone_number:
        # Check if chat_id exists in extra_data, or format from phone number
        chat_id = customer.extra_data.get("chat_id") if isinstance(customer.extra_data, dict) else None
        if not chat_id:
            raw_num = customer.phone_number.replace("+", "")
            chat_id = f"{raw_num}@c.us"
        try:
            await send_whatsapp_message(chat_id, request.message)
        except Exception as e:
            channel_status = f"error: {str(e)}"
    elif customer.channel == "telegram" and customer.telegram_user_id:
        try:
            await send_telegram_message(customer.telegram_user_id, request.message)
        except Exception as e:
            channel_status = f"error: {str(e)}"
    else:
        channel_status = "skipped_or_channel_not_supported"

    # Append the manual message to our internal history
    await save_manual_agent_message(db, customer_id, request.message)
    
    # Touch the customer updated_at timestamp so they sort to the top
    customer.ai_paused = True # Implicitly pause the AI if human takes over
    await db.commit()

    return {"status": "success", "ai_paused": True, "delivery": channel_status}
