# """
# WhatsApp webhook endpoints for receiving and processing messages.
# """

# import logging
# from fastapi import APIRouter, Request

# logger = logging.getLogger(__name__)

# router = APIRouter()


# @router.post("/whatsapp")
# async def whatsapp_webhook(request: Request):
#     """
#     WhatsApp webhook endpoint for WAHA (WhatsApp HTTP API).
    
#     Receives incoming messages from WhatsApp and logs the event to terminal.
#     """
#     data = await request.json()

#     logger.info(f"📨 WhatsApp Webhook Event Received")
#     logger.info(f"Raw Data: {data}")

#     payload = data.get("payload", {})

#     chat_id = payload.get("from")
#     message = payload.get("body")
#     from_me = payload.get("fromMe", False)
#     message_id = payload.get("id")

#     data = {
#         "chat_id": chat_id,
#         "message": message,
#         "message_id": message_id
#     }

#     # print(f"📱 Message from {chat_id}: {message} (ID: {message_id})")

#     return data


import logging
import time
from fastapi import APIRouter, Request

# ✅ Import your WAHA functions
from app.services.whatsapp.whatsapp import (
    send_whatsapp_message,
    start_typing,
    stop_typing
)

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/whatsapp")
async def whatsapp_webhook(request: Request):
    """
    WhatsApp webhook endpoint for WAHA (WhatsApp HTTP API).
    
    Receives incoming messages from WhatsApp and processes them.
    """
    data = await request.json()

    logger.info("📨 WhatsApp Webhook Event Received")
    logger.info(f"Raw Data: {data}")

    payload = data.get("payload", {})

    chat_id = payload.get("from")
    message = payload.get("body")
    from_me = payload.get("fromMe", False)
    message_id = payload.get("id")

    start_typing(chat_id)

    time.sleep(2)

    send_whatsapp_message(chat_id, reply)

    stop_typing(chat_id)

    return {
        "chat_id": chat_id,
        "message": message,
        "reply": reply,
        "status": "processed"
    }
