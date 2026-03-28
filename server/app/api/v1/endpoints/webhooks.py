"""
Webhook endpoints for receiving and processing messages from multiple channels.
Integrates with AI agent for automated customer support.
"""

import logging

from fastapi import APIRouter, Depends, Header, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.session import get_db
from app.services.telegram.webhook import send_telegram_message, send_typing_action
from app.services.agent.main import (
    get_chat_response,
    get_or_create_customer,
    save_manual_user_message,
    save_manual_agent_message,
)
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

        from_me = payload.get("fromMe", False)
        
        # Only process message events
        if event != "message":
            logger.info(f"⏭️ Skipping non-message event: {event}")
            return {"status": "skipped", "reason": f"event_type_{event}"}
            
        print(payload)
        # Extract message details
        chat_id = payload.get("from")
        
        # If it's sent by us (business), then the customer is 'to'
        if from_me:
            chat_id = payload.get("to")
            
        print(chat_id)
        print(payload.get("_data"))
        print(payload.get("_data").get("notifyName") if payload.get("_data") else None)
        full_name = payload.get("_data").get("notifyName") if payload.get("_data") else None
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

            if from_me:
                # This was a message sent externally via WhatsApp phone/web by a human agent
                logger.info(f"💾 Saving external business reply for {customer.id}")
                await save_manual_agent_message(db, customer.id, message_text)
                
                # Implicitly pause the AI if the human agent took over externally
                customer.ai_paused = True
                await db.commit()
                return {"status": "success", "reason": "external_business_reply"}

            if customer.ai_paused:
                logger.info(f"⏸️ AI paused for {customer.id}. Saving message manually.")
                await save_manual_user_message(db, customer.id, message_text)
                return {
                    "status": "success",
                    "customer_id": customer.id,
                    "chat_id": chat_id,
                    "message": message_text,
                    "reason": "ai_paused"
                }

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


@router.post("/telegram")
async def telegram_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
    x_telegram_bot_api_secret_token: str | None = Header(None),
):
    """
    Telegram webhook endpoint for Telegram Bot API.

    Receives incoming messages from Telegram and processes them with AI agent.

    Workflow:
    1. Receive update from Telegram
    2. Extract user info (user_id, username, full_name)
    3. Get or create customer in database
    4. Send to AI agent for response
    5. Send AI response back to Telegram

    Security:
    - Optional secret token verification via X-Telegram-Bot-Api-Secret-Token header
    """
    try:
        update_data = await request.json()

        logger.info("📨 Telegram Webhook Update Received")
        logger.debug(f"Raw Data: {update_data}")

        # Verify secret token if configured
        if settings.TELEGRAM_WEBHOOK_SECRET:
            if x_telegram_bot_api_secret_token != settings.TELEGRAM_WEBHOOK_SECRET:
                logger.warning("⚠️ Invalid Telegram webhook secret token")
                return {"status": "error", "reason": "invalid_secret_token"}

        # Extract message from update
        message = update_data.get("message")
        if not message:
            logger.info("⏭️ No message in update, skipping")
            return {"status": "skipped", "reason": "no_message"}

        # Extract user and message details
        user = message.get("from")
        if not user:
            logger.warning("⚠️ No user info in message")
            return {"status": "error", "reason": "no_user"}

        user_id = user.get("id")
        username = user.get("username")
        first_name = user.get("first_name", "")
        last_name = user.get("last_name", "")
        chat_id = message.get("chat", {}).get("id")
        message_text = message.get("text", "")

        # Skip if no message text
        if not message_text or not message_text.strip():
            logger.info("⏭️ Skipping empty message")
            return {"status": "skipped", "reason": "empty_message"}

        # Skip bot commands (except /start)
        if message_text.startswith("/") and message_text != "/start":
            logger.info(f"⏭️ Skipping command: {message_text}")
            return {"status": "skipped", "reason": "command"}

        # Handle /start command
        if message_text == "/start":
            message_text = "Hello! I'd like to get started."

        # Construct full name
        full_name = f"{first_name} {last_name}".strip()
        if not full_name:
            full_name = username or f"User {user_id}"

        logger.info(f"👤 Processing message from {full_name} (@{username}): {message_text}")

        # Show typing action
        await send_typing_action(chat_id)

        try:
            # Get or create customer in database (with profile picture)
            customer = await get_or_create_customer(
                db=db,
                telegram_user_id=str(user_id),
                channel="telegram",
                telegram_username=username,
                full_name=full_name,
            )

            logger.info(f"✅ Customer ID: {customer.id}")

            if customer.ai_paused:
                logger.info(f"⏸️ AI paused for {customer.id}. Saving message manually.")
                await save_manual_user_message(db, customer.id, message_text)
                return {
                    "status": "success",
                    "customer_id": customer.id,
                    "user_id": user_id,
                    "chat_id": chat_id,
                    "username": username,
                    "message": message_text,
                    "reason": "ai_paused"
                }

            # Get AI response
            response_data = await get_chat_response(
                prompt=message_text, customer_id=customer.id, db=db
            )

            ai_response = response_data["ai_response"]["content"]

            logger.info(f"🤖 AI Response: {ai_response[:100]}...")

            # Send response back to Telegram
            telegram_response = await send_telegram_message(chat_id, ai_response)

            logger.info(f"✅ Response sent to Telegram: {telegram_response}")

            return {
                "status": "success",
                "customer_id": customer.id,
                "user_id": user_id,
                "chat_id": chat_id,
                "username": username,
                "message": message_text,
                "reply": ai_response,
                "telegram_response": telegram_response,
            }

        except Exception as e:
            logger.error(f"❌ Error processing message: {e}", exc_info=True)

            # Try to send error message to user
            try:
                error_message = (
                    "Sorry, I encountered an error processing your message. "
                    "Please try again later."
                )
                await send_telegram_message(chat_id, error_message)
            except Exception as send_error:
                logger.error(f"Failed to send error message: {send_error}")

            return {
                "status": "error",
                "user_id": user_id,
                "chat_id": chat_id,
                "message": message_text,
                "error": str(e),
            }

    except Exception as e:
        logger.error(f"❌ Telegram webhook processing error: {e}", exc_info=True)
        return {"status": "error", "error": str(e)}
