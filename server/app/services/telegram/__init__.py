"""
Telegram service module for webhook-based integration.
"""

from .webhook import (
    bot,
    delete_webhook,
    get_telegram_profile_picture,
    get_webhook_info,
    send_telegram_message,
    send_typing_action,
    set_webhook,
)

__all__ = [
    "bot",
    "get_telegram_profile_picture",
    "send_telegram_message",
    "send_typing_action",
    "set_webhook",
    "delete_webhook",
    "get_webhook_info",
]
