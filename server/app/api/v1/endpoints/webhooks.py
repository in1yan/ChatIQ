"""
WhatsApp webhook endpoints for receiving and processing messages.
Integrates with AI agent for automated customer support.
"""

import logging

from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services.agent.main import get_chat_response, get_or_create_customer
from app.services.whatsapp.whatsapp import (
    send_whatsapp_message,
    start_typing,
    stop_typing,
)

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/whatsapp")
async def whatsapp_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """
    WhatsApp webhook endpoint for WAHA (WhatsApp HTTP API).

    Receives incoming messages from WhatsApp and processes them with AI agent.

    Workflow:
    1. Receive message from WhatsApp
    2. Extract customer info (phone number)
    3. Get or create customer in database
    4. Send to AI agent for response
    5. Send AI response back to WhatsApp
    """
    try:
        data = await request.json()

        logger.info("📨 WhatsApp Webhook Event Received")
        logger.info(f"Raw Data: {data}")

        # Extract payload (handle both nested and flat structures)
        payload = data.get("payload") or data
        event = data.get("event", "message")

        # Only process incoming messages (not our own)
        from_me = payload.get("fromMe", False)
        if from_me:
            logger.info("⏭️ Skipping message from self")
            return {"status": "skipped", "reason": "message_from_me"}

        # Only process message events
        if event != "message":
            logger.info(f"⏭️ Skipping non-message event: {event}")
            return {"status": "skipped", "reason": f"event_type_{event}"}
        print(payload)
        # Extract message details
        chat_id = payload.get("from")
        full_name = payload.get("notifyName")
        message_text = payload.get("body")
        message_id = payload.get("id")

        # Skip if no message text
        if not message_text or not message_text.strip():
            logger.info("⏭️ Skipping empty message")
            return {"status": "skipped", "reason": "empty_message"}

        # Extract phone number from chat_id (format: "1234567890@c.us")
        phone_number = chat_id.split("@")[0] if chat_id else None
        if not phone_number:
            logger.error("❌ Could not extract phone number from chat_id")
            return {"status": "error", "reason": "invalid_chat_id"}

        # Format phone number with + prefix
        if not phone_number.startswith("+"):
            phone_number = f"+{phone_number}"

        logger.info(f"📱 Processing message from {phone_number}: {message_text}")

        # Show typing indicator
        await start_typing(chat_id)

        try:
            # Get or create customer in database (with profile picture)
            customer = await get_or_create_customer(
                db=db,
                phone=phone_number,
                email=None,
                channel="whatsapp",
                chat_id=chat_id,  # Pass chat_id for profile picture fetching
                full_name=full_name,
            )

            logger.info(f"👤 Customer ID: {customer.id}")

            # Get AI response
            response_data = await get_chat_response(
                prompt=message_text, customer_id=customer.id, db=db
            )

            ai_response = response_data["ai_response"]["content"]

            logger.info(f"🤖 AI Response: {ai_response[:100]}...")

            # Send response back to WhatsApp
            whatsapp_response = await send_whatsapp_message(chat_id, ai_response)

            logger.info(f"✅ Response sent to WhatsApp: {whatsapp_response}")

            return {
                "status": "success",
                "customer_id": customer.id,
                "chat_id": chat_id,
                "message": message_text,
                "reply": ai_response,
                "whatsapp_response": whatsapp_response,
            }

        except Exception as e:
            logger.error(f"❌ Error processing message: {e}")
            # Try to send error message to user
            try:
                error_message = "Sorry, I encountered an error processing your message. Please try again later."
                await send_whatsapp_message(chat_id, error_message)
            except:
                pass  # Silently fail if can't send error message

            return {
                "status": "error",
                "chat_id": chat_id,
                "message": message_text,
                "message_id": message_id,
                "error": str(e),
            }

        finally:
            # Always stop typing indicator
            await stop_typing(chat_id)

    except Exception as e:
        logger.error(f"❌ Webhook processing error: {e}")
        return {"status": "error", "error": str(e)}
