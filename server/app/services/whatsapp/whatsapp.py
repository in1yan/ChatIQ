import requests

WAHA_URL = "http://localhost:3000/api/sendText"
API_KEY = "42acf499bce0482fa3e7b90068f71c45" 


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

    response = requests.post(WAHA_URL, json=payload, headers=headers)
    return response.json()