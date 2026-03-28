import asyncio
from app.db.session import async_session_maker
from sqlalchemy import select
from app.models import Customer
import httpx

async def main():
    async with async_session_maker() as session:
        result = await session.execute(select(Customer).where(Customer.channel == "whatsapp").limit(1))
        customer = result.scalar_one_or_none()
        if not customer:
            print("No whatsapp customer found!")
            return
        
        print(f"Testing reply for customer: {customer.id}, phone: {customer.phone_number}, extra: {customer.extra_data}")

        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"http://127.0.0.1:8000/api/v1/chat/{customer.id}/reply",
                json={"message": "Test message from API"}
            )
            print("Status:", resp.status_code)
            print("Response:", resp.text)

if __name__ == "__main__":
    asyncio.run(main())
