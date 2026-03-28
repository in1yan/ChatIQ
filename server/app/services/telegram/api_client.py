from aiogram import Bot
import os
from dotenv import load_dotenv
load_dotenv()
TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
# Initialize bot with HTML parsing by default
bot = Bot(token=TOKEN)

async def send_notification(chat_id: int, text: str):
    """Used for manual alerts or dashboard notifications"""
    try:
        await bot.send_message(chat_id=chat_id, text=text)
    except Exception as e:
        print(f"ERROR: Failed to send notification: {e}")

