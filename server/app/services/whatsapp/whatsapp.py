import requests
import time
from app.core.config import settings

WAHA_BASE_URL = settings.WAHA_BASE_URL
API_KEY = settings.WAHA_API_KEY


def send_whatsapp_message(chat_id: str, message: str):
    headers = {
        "accept": "application/json",
        "Content-Type": "application/json",
        "X-Api-Key": API_KEY
    }

    payload = {
        "chatId": chat_id,
        "text": message,
        "session": "default"
    }
    start_typing(chat_id)
    time.sleep(2)
    stop_typing(chat_id)
    response = requests.post(f"{WAHA_BASE_URL}/sendText", json=payload, headers=headers)
    return response.json()

def start_typing(chat_id: str, session: str = "default"):
    url = f"{WAHA_BASE_URL}/startTyping"

    headers = {
        "accept": "*/*",
        "Content-Type": "application/json",
        "X-Api-Key": API_KEY
    }

    payload = {
        "chatId": chat_id,
        "session": session
    }

    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        return response.json() if response.text else {"status": "typing_started"}
    except requests.exceptions.RequestException as e:
        print("Error starting typing:", e)
        return None
    
def stop_typing(chat_id: str, session: str = "default"):
    url = f"{WAHA_BASE_URL}/stopTyping"

    headers = {
        "accept": "*/*",
        "Content-Type": "application/json",
        "X-Api-Key": API_KEY
    }

    payload = {
        "chatId": chat_id,
        "session": session
    }

    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        return response.json() if response.text else {"status": "typing_stopped"}
    except requests.exceptions.RequestException as e:
        print("Error stopping typing:", e)
        return None