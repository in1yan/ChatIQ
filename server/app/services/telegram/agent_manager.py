import asyncpg
import os

DATABASE_URL = os.getenv("DATABASE_URL")

async def get_agent_response(chat_id: int, user_text: str):
    # 1. Connect to Postgres
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        # 2. Fetch business context (How should this agent behave?)
        # row = await conn.fetchrow("SELECT context FROM agents WHERE chat_id=$1", chatId)
        
        # 3. AI Logic (Placeholder for OpenAI/Claude)
        ai_reply = f"Agent Response to: {user_text}" 

        # 4. Log for Dashboard Insights
        await conn.execute(
            "INSERT INTO chat_logs (chat_id, message, direction, created_at) VALUES ($1, $2, $3, NOW())",
            chat_id, user_text, 'inbound'
        )
        return ai_reply
    finally:
        await conn.close()