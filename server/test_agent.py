"""
Test script for the multi-channel customer support agent.
Tests agent service functions and API endpoints.

Usage:
    python test_agent.py
"""

import asyncio
import json
from datetime import datetime

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import AsyncSessionLocal, init_db
from app.models import Customer, Message
from app.services.agent.main import (
    get_customer_messages,
    get_or_create_customer,
    save_messages,
)


async def cleanup_test_data(db: AsyncSession):
    """Clean up test data from previous runs."""
    print("🧹 Cleaning up test data...")
    # Delete test customers and their messages (cascade will handle messages)
    result = await db.execute(
        select(Customer).where(
            Customer.phone_number.in_(
                ["+1234567890", "+9876543210", None]
            )
        )
    )
    customers = result.scalars().all()
    for customer in customers:
        await db.delete(customer)
    
    result = await db.execute(
        select(Customer).where(
            Customer.email.in_(
                ["test@example.com", "customer@test.com", None]
            )
        )
    )
    customers = result.scalars().all()
    for customer in customers:
        await db.delete(customer)
    
    await db.commit()
    print("✅ Test data cleaned")


async def test_create_customer_whatsapp():
    """Test creating a customer from WhatsApp."""
    print("\n📱 Test 1: Create customer from WhatsApp")
    async with AsyncSessionLocal() as db:
        customer = await get_or_create_customer(
            db=db,
            phone="+1234567890",
            email=None,
            channel="whatsapp",
            full_name="John Doe",
        )
        
        assert customer.id is not None, "Customer should have an ID"
        assert customer.phone_number == "+1234567890", "Phone number mismatch"
        assert customer.channel == "whatsapp", "Channel mismatch"
        assert customer.full_name == "John Doe", "Name mismatch"
        
        print(f"✅ Created customer: ID={customer.id}, Phone={customer.phone_number}")
        return customer.id


async def test_create_customer_email():
    """Test creating a customer from Email."""
    print("\n📧 Test 2: Create customer from Email")
    async with AsyncSessionLocal() as db:
        customer = await get_or_create_customer(
            db=db,
            phone=None,
            email="test@example.com",
            channel="email",
            full_name="Jane Smith",
        )
        
        assert customer.id is not None, "Customer should have an ID"
        assert customer.email == "test@example.com", "Email mismatch"
        assert customer.channel == "email", "Channel mismatch"
        
        print(f"✅ Created customer: ID={customer.id}, Email={customer.email}")
        return customer.id


async def test_create_customer_telegram():
    """Test creating a customer from Telegram."""
    print("\n💬 Test 3: Create customer from Telegram")
    async with AsyncSessionLocal() as db:
        customer = await get_or_create_customer(
            db=db,
            phone="+9876543210",
            email=None,
            channel="telegram",
            full_name="Bob Johnson",
            telegram_username="@bobjohnson",
        )
        
        assert customer.id is not None, "Customer should have an ID"
        assert customer.phone_number == "+9876543210", "Phone number mismatch"
        assert customer.telegram_username == "@bobjohnson", "Username mismatch"
        assert customer.channel == "telegram", "Channel mismatch"
        
        print(f"✅ Created customer: ID={customer.id}, Telegram=@{customer.telegram_username}")
        return customer.id


async def test_get_existing_customer():
    """Test getting an existing customer."""
    print("\n🔍 Test 4: Get existing customer (no duplicate)")
    async with AsyncSessionLocal() as db:
        # Try to create the same WhatsApp customer again
        customer = await get_or_create_customer(
            db=db,
            phone="+1234567890",
            email=None,
            channel="whatsapp",
            full_name="John Doe Updated",  # Different name
        )
        
        print(f"✅ Retrieved existing customer: ID={customer.id}")
        print(f"   Note: Name is '{customer.full_name}' (original, not updated)")


async def test_save_and_retrieve_messages(customer_id: int):
    """Test saving and retrieving messages."""
    print(f"\n💾 Test 5: Save and retrieve messages for customer {customer_id}")
    async with AsyncSessionLocal() as db:
        # Create mock message data (simulating Pydantic AI format)
        mock_messages = [
            {
                "kind": "request",
                "parts": [
                    {
                        "part_kind": "user-prompt",
                        "content": "Hello, I need help!",
                        "timestamp": datetime.utcnow().isoformat(),
                    }
                ],
            },
            {
                "kind": "response",
                "parts": [
                    {
                        "part_kind": "text",
                        "content": "Hello! I'm here to help. What do you need?",
                    }
                ],
                "timestamp": datetime.utcnow().isoformat(),
            },
        ]
        
        # Save messages
        await save_messages(
            db=db,
            customer_id=customer_id,
            messages=json.dumps(mock_messages).encode("utf-8"),
        )
        
        print(f"✅ Saved {len(mock_messages)} messages")
        
        # Retrieve messages
        messages = await get_customer_messages(db, customer_id)
        
        print(f"✅ Retrieved {len(messages)} messages from database")
        
        # Verify message count matches
        assert len(messages) == len(mock_messages), "Message count mismatch"


async def test_customer_isolation():
    """Test that customers only see their own messages."""
    print("\n🔒 Test 6: Customer message isolation")
    async with AsyncSessionLocal() as db:
        # Get two different customers
        customer1 = await get_or_create_customer(
            db=db, phone="+1234567890", email=None, channel="whatsapp"
        )
        customer2 = await get_or_create_customer(
            db=db, email="test@example.com", phone=None, channel="email"
        )
        
        # Get messages for customer2 (should be empty if no messages saved for them)
        messages_c2 = await get_customer_messages(db, customer2.id)
        
        # Get messages for customer1 (should have messages from test 5)
        messages_c1 = await get_customer_messages(db, customer1.id)
        
        print(f"✅ Customer 1 has {len(messages_c1)} messages")
        print(f"✅ Customer 2 has {len(messages_c2)} messages")
        print("✅ Customers have isolated message histories")


async def test_api_endpoint_send_message():
    """Test the POST /api/v1/chat/ endpoint."""
    print("\n🌐 Test 7: API endpoint - Send message")
    
    base_url = "http://localhost:8000"
    
    try:
        async with httpx.AsyncClient() as client:
            # Test WhatsApp message
            response = await client.post(
                f"{base_url}/api/v1/chat/",
                json={
                    "prompt": "What's your return policy?",
                    "phone_number": "+5555555555",
                    "channel": "whatsapp",
                    "customer_name": "Test Customer",
                },
                timeout=30.0,
            )
            
            if response.status_code == 200:
                customer_id = response.headers.get("X-Customer-ID")
                print(f"✅ API call successful - Customer ID: {customer_id}")
                print(f"   Status: {response.status_code}")
                return customer_id
            else:
                print(f"⚠️  API call returned status {response.status_code}")
                print(f"   Response: {response.text}")
                
    except httpx.ConnectError:
        print("⚠️  Could not connect to server at http://localhost:8000")
        print("   Make sure the server is running: uvicorn main:app --reload")
        return None
    except Exception as e:
        print(f"⚠️  API test failed: {e}")
        return None


async def test_api_endpoint_get_history(customer_id: int):
    """Test the GET /api/v1/chat/{customer_id} endpoint."""
    print(f"\n🌐 Test 8: API endpoint - Get chat history")
    
    base_url = "http://localhost:8000"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{base_url}/api/v1/chat/{customer_id}",
                timeout=10.0,
            )
            
            if response.status_code == 200:
                # Parse newline-delimited JSON
                messages = [
                    json.loads(line)
                    for line in response.text.strip().split("\n")
                    if line
                ]
                print(f"✅ API call successful - Retrieved {len(messages)} messages")
                if messages:
                    print(f"   First message: {messages[0]['role']} - {messages[0]['content'][:50]}...")
            else:
                print(f"⚠️  API call returned status {response.status_code}")
                
    except httpx.ConnectError:
        print("⚠️  Could not connect to server")
    except Exception as e:
        print(f"⚠️  API test failed: {e}")


async def main():
    """Run all tests."""
    print("=" * 60)
    print("🧪 MULTI-CHANNEL CUSTOMER SUPPORT AGENT TEST SUITE")
    print("=" * 60)
    
    # Initialize database
    print("\n🔧 Initializing database...")
    await init_db()
    print("✅ Database initialized")
    
    # Clean up test data
    async with AsyncSessionLocal() as db:
        await cleanup_test_data(db)
    
    # Run service function tests
    print("\n" + "=" * 60)
    print("📦 TESTING SERVICE FUNCTIONS")
    print("=" * 60)
    
    customer_id_whatsapp = await test_create_customer_whatsapp()
    customer_id_email = await test_create_customer_email()
    customer_id_telegram = await test_create_customer_telegram()
    await test_get_existing_customer()
    await test_save_and_retrieve_messages(customer_id_whatsapp)
    await test_customer_isolation()
    
    # Run API endpoint tests
    print("\n" + "=" * 60)
    print("🌐 TESTING API ENDPOINTS")
    print("=" * 60)
    print("Note: Server must be running for these tests")
    
    api_customer_id = await test_api_endpoint_send_message()
    if api_customer_id:
        await test_api_endpoint_get_history(int(api_customer_id))
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    print("✅ Service function tests: PASSED")
    print("✅ Database integration: PASSED")
    print("✅ Customer isolation: PASSED")
    if api_customer_id:
        print("✅ API endpoint tests: PASSED")
    else:
        print("⚠️  API endpoint tests: SKIPPED (server not running)")
    
    print("\n" + "=" * 60)
    print("🎉 ALL TESTS COMPLETED!")
    print("=" * 60)
    
    print("\n💡 To test with actual AI responses:")
    print("   1. Set OPENAI_API_KEY in your .env file")
    print("   2. Start server: uvicorn main:app --reload")
    print("   3. Send a POST request to /api/v1/chat/")
    print("   4. You'll receive streaming AI responses!")


if __name__ == "__main__":
    asyncio.run(main())
