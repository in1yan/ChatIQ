import os

from aiogram import Bot
from dotenv import load_dotenv

TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
# Initialize bot with HTML parsing by default
bot = Bot(token=TOKEN)
