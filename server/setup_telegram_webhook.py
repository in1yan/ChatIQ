"""
Telegram webhook setup and management script.
Use this to register/remove webhooks with Telegram Bot API.
"""

import asyncio
import sys

try:
    from app.core.config import settings
    from app.services.telegram.webhook import (
        delete_webhook,
        get_webhook_info,
        set_webhook,
        bot,
    )
except ImportError as e:
    print(f"\n❌ Import Error: {e}")
    print("\nMake sure you have installed all dependencies:")
    print("  pip install aiogram")
    print("\nOr if using uv:")
    print("  uv pip install aiogram")
    sys.exit(1)


async def setup_webhook():
    """Register webhook with Telegram Bot API."""
    print("\n" + "=" * 60)
    print("Telegram Webhook Setup")
    print("=" * 60)

    # Check if bot is initialized
    if bot is None:
        print("\n❌ Telegram bot not initialized")
        print("Possible reasons:")
        print("  1. aiogram package not installed: pip install aiogram")
        print("  2. TELEGRAM_BOT_TOKEN not configured in .env")
        sys.exit(1)

    # Validate configuration
    if not settings.TELEGRAM_BOT_TOKEN:
        print("❌ TELEGRAM_BOT_TOKEN not configured in environment")
        print("Please add TELEGRAM_BOT_TOKEN to your .env file")
        sys.exit(1)

    if not settings.TELEGRAM_WEBHOOK_URL:
        print("❌ TELEGRAM_WEBHOOK_URL not configured in environment")
        print("Please add TELEGRAM_WEBHOOK_URL to your .env file")
        print("Example: TELEGRAM_WEBHOOK_URL=https://yourdomain.com/api/v1/webhook/telegram")
        sys.exit(1)

    print(f"\n📋 Configuration:")
    print(f"  Bot Token: {settings.TELEGRAM_BOT_TOKEN[:10]}...{settings.TELEGRAM_BOT_TOKEN[-4:]}")
    print(f"  Webhook URL: {settings.TELEGRAM_WEBHOOK_URL}")
    print(f"  Secret Token: {'Configured' if settings.TELEGRAM_WEBHOOK_SECRET else 'Not set'}")

    print(f"\n🔧 Setting webhook...")

    try:
        result = await set_webhook(
            webhook_url=settings.TELEGRAM_WEBHOOK_URL,
            secret_token=settings.TELEGRAM_WEBHOOK_SECRET or None,
        )

        if result:
            print("✅ Webhook set successfully!")
            print(f"\n📡 Webhook URL: {settings.TELEGRAM_WEBHOOK_URL}")
            print(f"🔐 Secret Token: {'Enabled' if settings.TELEGRAM_WEBHOOK_SECRET else 'Disabled'}")

            # Get webhook info to confirm
            info = await get_webhook_info()
            print(f"\n📊 Webhook Status:")
            print(f"  URL: {info['url']}")
            print(f"  Pending Updates: {info['pending_update_count']}")
            if info['last_error_message']:
                print(f"  Last Error: {info['last_error_message']}")
        else:
            print("❌ Failed to set webhook")
            sys.exit(1)

    except Exception as e:
        print(f"❌ Error setting webhook: {e}")
        sys.exit(1)

    print("\n" + "=" * 60)
    print("✅ Webhook setup complete!")
    print("=" * 60)
    print("\n📝 Next steps:")
    print("  1. Make sure your FastAPI server is running")
    print("  2. Ensure webhook URL is publicly accessible (use ngrok for local)")
    print("  3. Send a message to your bot on Telegram")
    print("  4. Check your server logs for incoming webhook updates")
    print()


async def remove_webhook():
    """Remove webhook from Telegram Bot API."""
    print("\n" + "=" * 60)
    print("Telegram Webhook Removal")
    print("=" * 60)

    if not settings.TELEGRAM_BOT_TOKEN:
        print("❌ TELEGRAM_BOT_TOKEN not configured")
        sys.exit(1)

    print(f"\n⚠️  This will remove the webhook and clear pending updates")
    print(f"🔧 Removing webhook...")

    try:
        result = await delete_webhook()

        if result:
            print("✅ Webhook removed successfully!")
            print("\n📝 You can now use polling mode or set a new webhook")
        else:
            print("❌ Failed to remove webhook")
            sys.exit(1)

    except Exception as e:
        print(f"❌ Error removing webhook: {e}")
        sys.exit(1)

    print("\n" + "=" * 60)


async def show_webhook_info():
    """Display current webhook information."""
    print("\n" + "=" * 60)
    print("Telegram Webhook Information")
    print("=" * 60)

    if not settings.TELEGRAM_BOT_TOKEN:
        print("❌ TELEGRAM_BOT_TOKEN not configured")
        sys.exit(1)

    try:
        info = await get_webhook_info()

        print(f"\n📊 Current Webhook Status:")
        print(f"  URL: {info['url'] or 'Not set'}")
        print(f"  Has Custom Certificate: {info['has_custom_certificate']}")
        print(f"  Pending Updates: {info['pending_update_count']}")
        print(f"  Max Connections: {info['max_connections']}")
        print(f"  Allowed Updates: {info['allowed_updates']}")

        if info['last_error_date']:
            print(f"\n⚠️  Last Error:")
            print(f"  Date: {info['last_error_date']}")
            print(f"  Message: {info['last_error_message']}")
        else:
            print(f"\n✅ No recent errors")

    except Exception as e:
        print(f"❌ Error getting webhook info: {e}")
        sys.exit(1)

    print("\n" + "=" * 60)


def print_usage():
    """Print usage instructions."""
    print("\nTelegram Webhook Management")
    print("=" * 60)
    print("\nUsage:")
    print("  python setup_telegram_webhook.py [command]")
    print("\nCommands:")
    print("  setup   - Register webhook with Telegram Bot API")
    print("  remove  - Remove webhook from Telegram Bot API")
    print("  info    - Display current webhook information")
    print("  help    - Show this help message")
    print("\nExamples:")
    print("  python setup_telegram_webhook.py setup")
    print("  python setup_telegram_webhook.py info")
    print("\nRequirements:")
    print("  - aiogram package installed (pip install aiogram)")
    print("  - TELEGRAM_BOT_TOKEN configured in .env")
    print("  - TELEGRAM_WEBHOOK_URL configured in .env")
    print()


async def main():
    """Main entry point."""
    # Get command from command line
    command = sys.argv[1] if len(sys.argv) > 1 else "help"

    if command == "setup":
        await setup_webhook()
    elif command == "remove":
        await remove_webhook()
    elif command == "info":
        await show_webhook_info()
    elif command == "help":
        print_usage()
    else:
        print(f"❌ Unknown command: {command}")
        print_usage()
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
