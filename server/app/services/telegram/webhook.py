"""
Telegram webhook service module.
Provides functions for Telegram Bot API integration via webhooks.
"""

import logging
from io import BytesIO
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from aiogram import Bot
    from aiogram.enums import ChatAction
else:
    try:
        from aiogram import Bot
        from aiogram.enums import ChatAction
    except ImportError:
        Bot = None  # type: ignore
        ChatAction = None  # type: ignore

from app.core.config import settings

logger = logging.getLogger(__name__)

# Initialize bot instance only if aiogram is available
try:
    bot = Bot(token=settings.TELEGRAM_BOT_TOKEN) if settings.TELEGRAM_BOT_TOKEN and Bot else None
except Exception as e:
    logger.warning(f"Failed to initialize Telegram bot: {e}")
    bot = None


async def get_telegram_profile_picture(user_id: int) -> str | None:
    """
    Fetch Telegram user profile picture URL.

    Args:
        user_id: Telegram user ID

    Returns:
        Profile picture URL or None if unavailable
    """
    if not bot:
        logger.error("Telegram bot not initialized")
        return None

    try:
        # Get user profile photos
        photos = await bot.get_user_profile_photos(user_id, limit=1)

        if photos.total_count == 0:
            logger.info(f"No profile picture for user {user_id}")
            return None

        # Get the largest photo size
        photo = photos.photos[0][-1]

        # Get file info
        file_info = await bot.get_file(photo.file_id)

        # Construct Telegram file URL
        # Note: This URL is accessible via Telegram's CDN
        file_url = f"https://api.telegram.org/file/bot{settings.TELEGRAM_BOT_TOKEN}/{file_info.file_path}"

        logger.info(f"✅ Profile picture fetched for user {user_id}")
        return file_url

    except Exception as e:
        logger.error(f"Error fetching Telegram profile picture for user {user_id}: {e}")
        return None


async def send_telegram_message(chat_id: int, text: str) -> dict:
    """
    Send a message to a Telegram chat.

    Args:
        chat_id: Telegram chat ID
        text: Message text to send

    Returns:
        Response data from Telegram API
    """
    if not bot:
        raise ValueError("Telegram bot not initialized")

    try:
        message = await bot.send_message(chat_id=chat_id, text=text)

        logger.info(f"✅ Message sent to Telegram chat {chat_id}")

        return {
            "message_id": message.message_id,
            "chat_id": message.chat.id,
            "date": message.date.isoformat() if message.date else None,
        }

    except Exception as e:
        logger.error(f"Error sending Telegram message to chat {chat_id}: {e}")
        raise


async def send_typing_action(chat_id: int) -> None:
    """
    Send typing action to indicate bot is processing.

    Args:
        chat_id: Telegram chat ID
    """
    if not bot:
        logger.warning("Telegram bot not initialized, skipping typing action")
        return

    try:
        await bot.send_chat_action(chat_id=chat_id, action=ChatAction.TYPING)
        logger.debug(f"Typing action sent to chat {chat_id}")

    except Exception as e:
        logger.warning(f"Error sending typing action to chat {chat_id}: {e}")
        # Non-critical, don't raise


async def download_profile_picture(user_id: int) -> BytesIO | None:
    """
    Download Telegram user profile picture as bytes.
    Useful if you need to upload to your own storage.

    Args:
        user_id: Telegram user ID

    Returns:
        BytesIO object with image data or None
    """
    if not bot:
        logger.error("Telegram bot not initialized")
        return None

    try:
        photos = await bot.get_user_profile_photos(user_id, limit=1)

        if photos.total_count == 0:
            return None

        photo = photos.photos[0][-1]
        file_info = await bot.get_file(photo.file_id)

        # Download the file
        file_bytes = BytesIO()
        await bot.download_file(file_info.file_path, file_bytes)
        file_bytes.seek(0)

        logger.info(f"✅ Profile picture downloaded for user {user_id}")
        return file_bytes

    except Exception as e:
        logger.error(f"Error downloading profile picture for user {user_id}: {e}")
        return None


# Webhook utilities

async def set_webhook(webhook_url: str, secret_token: str | None = None) -> bool:
    """
    Register webhook with Telegram Bot API.

    Args:
        webhook_url: Public URL for webhook endpoint
        secret_token: Optional secret token for verification

    Returns:
        True if webhook was set successfully
    """
    if not bot:
        raise ValueError("Telegram bot not initialized")

    try:
        result = await bot.set_webhook(
            url=webhook_url,
            secret_token=secret_token,
            allowed_updates=["message"],  # Only receive message updates
            drop_pending_updates=True,  # Clear pending updates
        )

        if result:
            logger.info(f"✅ Telegram webhook set to: {webhook_url}")
        else:
            logger.error(f"❌ Failed to set Telegram webhook")

        return result

    except Exception as e:
        logger.error(f"Error setting Telegram webhook: {e}")
        raise


async def delete_webhook() -> bool:
    """
    Remove webhook from Telegram Bot API.
    Useful for local development or switching to polling mode.

    Returns:
        True if webhook was deleted successfully
    """
    if not bot:
        raise ValueError("Telegram bot not initialized")

    try:
        result = await bot.delete_webhook(drop_pending_updates=True)

        if result:
            logger.info("✅ Telegram webhook deleted")
        else:
            logger.error("❌ Failed to delete Telegram webhook")

        return result

    except Exception as e:
        logger.error(f"Error deleting Telegram webhook: {e}")
        raise


async def get_webhook_info() -> dict:
    """
    Get current webhook information from Telegram.

    Returns:
        Webhook info dict
    """
    if not bot:
        raise ValueError("Telegram bot not initialized")

    try:
        info = await bot.get_webhook_info()

        return {
            "url": info.url,
            "has_custom_certificate": info.has_custom_certificate,
            "pending_update_count": info.pending_update_count,
            "last_error_date": info.last_error_date,
            "last_error_message": info.last_error_message,
            "max_connections": info.max_connections,
            "allowed_updates": info.allowed_updates,
        }

    except Exception as e:
        logger.error(f"Error getting webhook info: {e}")
        raise
