"""
Quick manual test script for the chat API endpoints.
This script makes HTTP requests to test the live API.

Usage:
    1. Start the server: uvicorn main:app --reload
    2. Run this script: python test_api_manual.py
"""

import asyncio
import json

import httpx


BASE_URL = "http://localhost:8000"


async def test_whatsapp_customer():
    """Test creating a customer and chatting via WhatsApp."""
    print("\n" + "=" * 60)
    print("📱 TEST: WhatsApp Customer Chat")
    print("=" * 60)
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        # Send a message
        print("\n1️⃣ Sending message from WhatsApp customer...")
        response = await client.post(
            f"{BASE_URL}/api/v1/chat/",
            json={
                "prompt": "Hello! Can you tell me about your business hours?",
                "phone_number": "+1234567890",
                "channel": "whatsapp",
                "customer_name": "John Doe",
            },
        )
        
        print(f"Status: {response.status_code}")
        
        # Parse JSON response (no longer streaming)
        if response.status_code == 200:
            data = response.json()
            customer_id = data.get("customer_id")
            print(f"Customer ID: {customer_id}")
            
            print("\n📨 Response:")
            print("-" * 60)
            print(f"👤 User: {data['user_message']['content']}")
            print(f"🤖 AI: {data['ai_response']['content']}")
            print("-" * 60)
            
            # Get chat history
            if customer_id:
                print(f"\n2️⃣ Fetching chat history for customer {customer_id}...")
                history_response = await client.get(f"{BASE_URL}/api/v1/chat/{customer_id}")
                print(f"Status: {history_response.status_code}")
                
                messages = [
                    json.loads(line)
                    for line in history_response.text.strip().split("\n")
                    if line
                ]
                print(f"Total messages in history: {len(messages)}")
        else:
            print(f"Error: {response.text}")


async def test_email_customer():
    """Test creating a customer and chatting via Email."""
    print("\n" + "=" * 60)
    print("📧 TEST: Email Customer Chat")
    print("=" * 60)
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        print("\n1️⃣ Sending message from Email customer...")
        response = await client.post(
            f"{BASE_URL}/api/v1/chat/",
            json={
                "prompt": "I need help resetting my password.",
                "email": "customer@example.com",
                "channel": "email",
                "customer_name": "Jane Smith",
            },
        )
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            customer_id = data.get("customer_id")
            print(f"Customer ID: {customer_id}")
            
            print("\n📨 Response:")
            print("-" * 60)
            print(f"👤 User: {data['user_message']['content']}")
            print(f"🤖 AI: {data['ai_response']['content']}")
            print("-" * 60)
        else:
            print(f"Error: {response.text}")


async def test_telegram_customer():
    """Test creating a customer and chatting via Telegram."""
    print("\n" + "=" * 60)
    print("💬 TEST: Telegram Customer Chat")
    print("=" * 60)
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        print("\n1️⃣ Sending message from Telegram customer...")
        response = await client.post(
            f"{BASE_URL}/api/v1/chat/",
            json={
                "prompt": "What products do you offer?",
                "phone_number": "+9876543210",
                "channel": "telegram",
                "customer_name": "Bob Wilson",
                "telegram_username": "@bobwilson",
            },
        )
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            customer_id = data.get("customer_id")
            print(f"Customer ID: {customer_id}")
            
            print("\n📨 Response:")
            print("-" * 60)
            print(f"👤 User: {data['user_message']['content']}")
            print(f"🤖 AI: {data['ai_response']['content']}")
            print("-" * 60)
        else:
            print(f"Error: {response.text}")


async def test_conversation_continuation():
    """Test continuing a conversation with an existing customer."""
    print("\n" + "=" * 60)
    print("🔄 TEST: Conversation Continuation")
    print("=" * 60)
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        # First message
        print("\n1️⃣ First message...")
        response1 = await client.post(
            f"{BASE_URL}/api/v1/chat/",
            json={
                "prompt": "What's your return policy?",
                "phone_number": "+5555555555",
                "channel": "whatsapp",
                "customer_name": "Test User",
            },
        )
        
        if response1.status_code == 200:
            data1 = response1.json()
            customer_id = data1.get("customer_id")
            print(f"Customer ID: {customer_id}")
            print(f"🤖 AI: {data1['ai_response']['content'][:100]}...")
            
            # Second message (should have context from first)
            print("\n2️⃣ Follow-up message (should have conversation context)...")
            response2 = await client.post(
                f"{BASE_URL}/api/v1/chat/",
                json={
                    "prompt": "How long does it take?",  # Context-dependent question
                    "phone_number": "+5555555555",  # Same customer
                    "channel": "whatsapp",
                },
            )
            
            if response2.status_code == 200:
                data2 = response2.json()
                print("\n📨 AI response (should understand context):")
                print("-" * 60)
                print(f"🤖 {data2['ai_response']['content']}")
                print("-" * 60)
            
            # Get full history
            if customer_id:
                print(f"\n3️⃣ Full conversation history:")
                history = await client.get(f"{BASE_URL}/api/v1/chat/{customer_id}")
                messages = [
                    json.loads(line)
                    for line in history.text.strip().split("\n")
                    if line
                ]
                print(f"Total messages: {len(messages)}")
                for msg in messages:
                    role_emoji = "👤" if msg["role"] == "user" else "🤖"
                    content = msg["content"][:80] + "..." if len(msg["content"]) > 80 else msg["content"]
                    print(f"{role_emoji} {content}")
        else:
            print(f"Error: {response1.text}")


async def main():
    """Run all manual tests."""
    print("=" * 60)
    print("🧪 CHAT API MANUAL TEST SUITE")
    print("=" * 60)
    print("\n⚠️  Prerequisites:")
    print("   1. Server running: uvicorn main:app --reload")
    print("   2. OPENAI_API_KEY set in environment (for AI responses)")
    print("   3. Database initialized")
    
    try:
        # Test connection
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{BASE_URL}/")
            print(f"\n✅ Server is running (status: {response.status_code})")
        
        # Run tests
        await test_whatsapp_customer()
        await test_email_customer()
        await test_telegram_customer()
        await test_conversation_continuation()
        
        print("\n" + "=" * 60)
        print("🎉 ALL TESTS COMPLETED!")
        print("=" * 60)
        
    except httpx.ConnectError:
        print("\n❌ ERROR: Could not connect to server")
        print("   Please start the server: uvicorn main:app --reload")
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())
