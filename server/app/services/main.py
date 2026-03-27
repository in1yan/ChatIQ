from fastapi import FastAPI, Request
from services.whatsapp import send_whatsapp_message

app = FastAPI()


@app.get("/")
def home():
    return {"message": "ChatIQ Backend Running"}


@app.post("/webhook/waha")
async def waha_webhook(request: Request):
    data = await request.json()

    print("RAW DATA:", data)

    payload = data.get("payload", {})

    chat_id = payload.get("from")
    message = payload.get("body")
    from_me = payload.get("fromMe", False)

    if from_me:
        return {"status": "ignored"}

    print(f"User: {chat_id} → {message}")

    reply = generate_reply(message)

    send_whatsapp_message(chat_id, reply)

    return {"status": "processed"}


def generate_reply(message: str):
    message = message.lower()

    return "Thanks for your message!"