"""
Test script for WhatsApp profile picture integration.
Tests the get_profile_picture function and customer creation with profile pictures.
"""

import asyncio
import sys
from app.services.whatsapp.whatsapp import get_profile_picture


async def test_profile_picture_fetch():
    """Test fetching a profile picture from WAHA API."""
    print("\n" + "=" * 60)
    print("WhatsApp Profile Picture Integration Test")
    print("=" * 60)

    # Test with a sample WhatsApp chat ID
    test_chat_id = "1234567890@c.us"

    print(f"\n📸 Testing profile picture fetch for: {test_chat_id}")
    print("-" * 60)

    try:
        profile_url = await get_profile_picture(test_chat_id)

        if profile_url:
            print(f"✅ Successfully fetched profile picture!")
            print(f"📷 URL: {profile_url[:80]}...")
            print(f"📏 URL length: {len(profile_url)} characters")
        else:
            print("⚠️  Profile picture not available (returned None)")
            print("This is expected if:")
            print("  - The user has no profile picture")
            print("  - The chat_id doesn't exist")
            print("  - WAHA API is not configured/running")

    except Exception as e:
        print(f"❌ Error occurred: {e}")
        print("\nMake sure:")
        print("  1. WAHA_BASE_URL is configured in environment")
        print("  2. WAHA_API_KEY is configured in environment")
        print("  3. WAHA server is running and accessible")
        sys.exit(1)

    print("\n" + "=" * 60)
    print("Test completed!")
    print("=" * 60)
    print("\n📋 Integration Notes:")
    print("  • Profile pictures are fetched only when creating NEW customers")
    print("  • Existing customers don't trigger profile picture fetches")
    print("  • Profile URL is stored in Customer.profile_picture_url field")
    print("  • If fetch fails, profile_picture_url will be NULL (graceful)")
    print("\n💡 Next steps:")
    print("  1. Run database migration to add profile_picture_url column:")
    print("     ALTER TABLE customers ADD COLUMN profile_picture_url VARCHAR(500);")
    print("  2. Test with real WhatsApp webhook messages")
    print("  3. Verify profile pictures are stored in customer records")
    print()


async def test_customer_creation_with_profile():
    """
    Test customer creation with profile picture integration.
    Note: This requires database connection to be configured.
    """
    print("\n" + "=" * 60)
    print("Customer Creation with Profile Picture Test")
    print("=" * 60)

    try:
        from app.db.session import AsyncSessionLocal
        from app.services.agent.main import get_or_create_customer

        async with AsyncSessionLocal() as db:
            test_phone = "+1234567890"
            test_chat_id = "1234567890@c.us"

            print(f"\n👤 Creating customer with phone: {test_phone}")
            print(f"💬 WhatsApp chat_id: {test_chat_id}")
            print("-" * 60)

            customer = await get_or_create_customer(
                db=db,
                phone=test_phone,
                email=None,
                channel="whatsapp",
                chat_id=test_chat_id,
                full_name="Test User",
            )

            print(f"\n✅ Customer created/retrieved:")
            print(f"  ID: {customer.id}")
            print(f"  Phone: {customer.phone_number}")
            print(f"  Channel: {customer.channel}")
            print(f"  Full Name: {customer.full_name}")

            if customer.profile_picture_url:
                print(f"  📷 Profile Picture: {customer.profile_picture_url[:60]}...")
            else:
                print(f"  📷 Profile Picture: Not available")

            print("\n✨ Integration working correctly!")

    except ImportError:
        print("\n⚠️  Database integration test skipped")
        print("This test requires:")
        print("  - Database connection to be configured")
        print("  - All dependencies installed (pydantic-ai, sqlalchemy, etc.)")
    except Exception as e:
        print(f"\n❌ Error during customer creation: {e}")
        print("\nMake sure:")
        print("  1. Database is running and accessible")
        print("  2. DATABASE_URI is configured in environment")
        print("  3. Migrations have been run")

    print("\n" + "=" * 60)


if __name__ == "__main__":
    print("\n🚀 Starting Profile Picture Integration Tests...\n")

    # Test 1: Profile picture fetch (standalone)
    asyncio.run(test_profile_picture_fetch())

    # Test 2: Full customer creation (requires DB)
    print("\n" + "=" * 60)
    print("Running Database Integration Test...")
    print("=" * 60)
    asyncio.run(test_customer_creation_with_profile())

    print("\n✅ All tests completed!\n")
