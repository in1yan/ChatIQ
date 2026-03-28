# services/telegram/__init__.py

from .bot_logic import dp
from .api_client import bot, send_notification
from .agent_manager import get_agent_response

# The __all__ list defines what is exported when someone 
# writes "from services.telegram import *"
__all__ = [
    "dp", 
    "bot", 
    "send_notification", 
    "get_agent_response"
]