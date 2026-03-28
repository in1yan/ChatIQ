"""
Chat endpoints for multi-channel customer support.
Handles WhatsApp, Telegram, and Email customer interactions with AI agent.
"""

import json

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.dependancies.auth import get_current_user
from app.schemas.chat import (
    ChatMessage,
    ChatRequest,
    ChatResponse,
    CustomerResponse,
    SendMessageRequest,
    SendMessageResponse,
)
from app.services.agent.main import (
    get_chat_response,
    get_customer_messages,
    get_or_create_customer,
    send_direct_message,
    to_chat_message,
)

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
    """
    Retrieve all chat messages for a specific customer.

    Args:
        customer_id: Customer ID
        db: Database session

    Returns:
        Newline-delimited JSON chat messages
    """
    # Get all messages for the customer
    messages = await get_customer_messages(db, customer_id)

    # Convert to chat message format
    chat_messages = []
    for msg in messages:
        try:
            chat_messages.append(to_chat_message(msg))
        except Exception:
            # Skip messages that can't be converted
            continue

    # Return as newline-delimited JSON
    return Response(
        b"\n".join(json.dumps(m).encode("utf-8") for m in chat_messages),
        media_type="text/plain",
    )


@router.post(
    "/send",
    status_code=status.HTTP_200_OK,
    summary="Send direct message to customer",
    response_description="Message delivery confirmation",
    response_model=SendMessageResponse,
)
async def send_message_to_customer(
    request: SendMessageRequest,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user),
) -> SendMessageResponse:
    """
    Send a direct message to a customer via their preferred channel.

    This endpoint allows authenticated users to send human-written messages
    directly to customers via WhatsApp or Telegram. Messages do NOT go through
    the AI agent - they are sent as-is to the customer.

    Args:
        request: Send message request with customer_id, message, and channel
        db: Database session
        current_user: Authenticated user (required)

    Returns:
        Message delivery confirmation with message ID and timestamp

    Raises:
        400: Bad request (customer not found, channel not supported, etc.)
        401: Unauthorized (no valid authentication token)
        500: Failed to send message
    """
    try:
        # Call the service to send the message
        response_data = await send_direct_message(db, request.customer_id, request.message)

        # Verify the channel matches the request
        if response_data["channel"] != request.channel:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Customer's channel ({response_data['channel']}) does not match requested channel ({request.channel})",
            )

        return SendMessageResponse(**response_data)

    except ValueError as e:
        # Validation errors from service layer
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        # Unexpected errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send message: {str(e)}",
        )
