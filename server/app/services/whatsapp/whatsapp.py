"""
WhatsApp HTTP API (WAHA) integration module.
Provides functions to send messages and control typing indicators via WAHA.
"""

import httpx
from app.core.config import settings

WAHA_BASE_URL = settings.WAHA_BASE_URL
API_KEY = settings.WAHA_API_KEY


async def get_profile_picture(chat_id: str, session: str = "default") -> str | None:
    """
    Fetch WhatsApp profile picture URL from WAHA API.

    Args:
        chat_id: WhatsApp chat ID (format: "1234567890@c.us")
        session: WAHA session name (default: "default")

    Returns:
        Profile picture URL or None if unavailable/error
    """
    try:
        # URL encode the chat_id for the API request
        import urllib.parse
        encoded_chat_id = urllib.parse.quote(chat_id, safe='')
        
        url = f"{WAHA_BASE_URL}/{session}/chats/{encoded_chat_id}/picture?refresh=true"

        headers = {
            "accept": "application/json",
            "X-Api-Key": API_KEY,
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            data = response.json()
            return data.get("url")

    except httpx.HTTPError as e:
        print(f"Error fetching profile picture for {chat_id}: {e}")
        return None
    except Exception as e:
        print(f"Unexpected error fetching profile picture: {e}")
        return None


async def send_whatsapp_message(chat_id: str, message: str, session: str = "default"):
    """
    Send a text message via WhatsApp.

    Args:
        chat_id: WhatsApp chat ID (format: "1234567890@c.us")
        message: Text message to send
        session: WAHA session name (default: "default")

    Returns:
        Response JSON from WAHA API
    """
    headers = {
        "accept": "application/json",
        "Content-Type": "application/json",
        "X-Api-Key": API_KEY,
    }

    payload = {"chatId": chat_id, "text": message, "session": session}

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            f"{WAHA_BASE_URL}/sendText", json=payload, headers=headers
        )
        response.raise_for_status()
        return response.json() if response.text.strip() else {"status": "success"}


async def start_typing(chat_id: str, session: str = "default"):
    """
    Start typing indicator in WhatsApp chat.

    Args:
        chat_id: WhatsApp chat ID
        session: WAHA session name (default: "default")

    Returns:
        Response JSON or error dict
    """
    url = f"{WAHA_BASE_URL}/startTyping"

    headers = {
        "accept": "*/*",
        "Content-Type": "application/json",
        "X-Api-Key": API_KEY,
    }

    payload = {"chatId": chat_id, "session": session}

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            return response.json() if response.text else {"status": "typing_started"}
    except httpx.HTTPError as e:
        print(f"Error starting typing: {e}")
        return {"status": "error", "error": str(e)}


async def stop_typing(chat_id: str, session: str = "default"):
    """
    Stop typing indicator in WhatsApp chat.

    Args:
        chat_id: WhatsApp chat ID
        session: WAHA session name (default: "default")

    Returns:
        Response JSON or error dict
    """
    url = f"{WAHA_BASE_URL}/stopTyping"

    headers = {
        "accept": "*/*",
        "Content-Type": "application/json",
        "X-Api-Key": API_KEY,
    }

    payload = {"chatId": chat_id, "session": session}

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            return response.json() if response.text else {"status": "typing_stopped"}
    except httpx.HTTPError as e:
        print(f"Error stopping typing: {e}")
        return {"status": "error", "error": str(e)}