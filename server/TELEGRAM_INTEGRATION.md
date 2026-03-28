# Telegram Webhook Integration - Implementation Guide

## Overview
Successfully implemented a webhook-based Telegram integration that mirrors the WhatsApp implementation. The system now supports multi-channel customer support with AI agents across WhatsApp, Telegram, and Email.

## What Was Implemented

### 1. Database Changes
**File:** `app/models/customers.py`
- Added `telegram_user_id` field with unique constraint and index
- Updated check constraint to allow telegram_user_id as valid identifier
- Migration: `migrations/add_telegram_user_id.sql`

### 2. Telegram Service
**File:** `app/services/telegram/webhook.py`
- `get_telegram_profile_picture(user_id)` - Fetches user profile photos via Bot API
- `send_telegram_message(chat_id, text)` - Sends messages back to users
- `send_typing_action(chat_id)` - Shows typing indicator during AI processing
- `set_webhook(url)` - Registers webhook with Telegram Bot API
- `delete_webhook()` - Removes webhook
- `get_webhook_info()` - Gets current webhook status

### 3. Customer Service Update
**File:** `app/services/agent/main.py`
- Updated `get_or_create_customer()` to support `telegram_user_id` parameter
- Added Telegram profile picture fetching on customer creation
- Supports all three identifiers: phone, email, telegram_user_id

### 4. Webhook Endpoint
**File:** `app/api/v1/endpoints/webhooks.py`
- New route: `POST /api/v1/webhook/telegram`
- Parses Telegram updates and extracts user information
- Creates/retrieves customers with profile pictures
- Integrates with AI agent for responses
- Handles /start command and errors gracefully
- Optional secret token verification

### 5. Configuration
**File:** `app/core/config.py`
- Added `TELEGRAM_BOT_TOKEN` - Bot token from @BotFather
- Added `TELEGRAM_WEBHOOK_URL` - Public webhook URL
- Added `TELEGRAM_WEBHOOK_SECRET` - Optional secret for verification

### 6. Webhook Setup Script
**File:** `setup_telegram_webhook.py`
- Register webhook: `python setup_telegram_webhook.py setup`
- Remove webhook: `python setup_telegram_webhook.py remove`
- Check status: `python setup_telegram_webhook.py info`

### 7. Test Suite
**File:** `test_telegram_webhook.py`
- Profile picture fetching tests
- Customer creation tests
- Webhook endpoint tests
- Command handling tests
- Edge case tests

## Environment Variables

Add these to your `.env` file:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
TELEGRAM_WEBHOOK_URL=https://yourdomain.com/api/v1/webhook/telegram
TELEGRAM_WEBHOOK_SECRET=optional_secret_for_verification
```

## Database Migration

Run the migration to add the telegram_user_id column:

```sql
-- Add telegram_user_id column
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS telegram_user_id VARCHAR(50) UNIQUE;

-- Add index
CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_telegram_user_id 
ON customers(telegram_user_id) 
WHERE telegram_user_id IS NOT NULL;

-- Update check constraint
ALTER TABLE customers DROP CONSTRAINT IF EXISTS check_identifier;
ALTER TABLE customers ADD CONSTRAINT check_identifier 
CHECK (
    phone_number IS NOT NULL OR 
    email IS NOT NULL OR 
    telegram_user_id IS NOT NULL
);
```

Or use the provided SQL file:
```bash
psql -U your_user -d your_database -f migrations/add_telegram_user_id.sql
```

## Setup Instructions

### 1. Get Bot Token
1. Talk to @BotFather on Telegram
2. Create a new bot or use existing: `/newbot`
3. Copy the bot token

### 2. Configure Environment
```bash
# Add to .env
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_WEBHOOK_URL=https://yourdomain.com/api/v1/webhook/telegram
TELEGRAM_WEBHOOK_SECRET=my_secure_secret_123  # Optional but recommended
```

### 3. Run Database Migration
```bash
psql -U postgres -d chatiq -f migrations/add_telegram_user_id.sql
```

### 4. Start Your Server
```bash
uvicorn app.main:app --reload
```

### 5. Register Webhook
```bash
python setup_telegram_webhook.py setup
```

Output should show:
```
✅ Webhook set successfully!
📡 Webhook URL: https://yourdomain.com/api/v1/webhook/telegram
```

### 6. Test the Bot
1. Find your bot on Telegram
2. Send `/start` or any message
3. Check server logs for webhook activity

## Local Development with ngrok

For local testing, use ngrok to expose your local server:

```bash
# Start ngrok
ngrok http 8000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
# Update .env with:
TELEGRAM_WEBHOOK_URL=https://abc123.ngrok.io/api/v1/webhook/telegram

# Register webhook
python setup_telegram_webhook.py setup
```

## Architecture

### Message Flow
```
Telegram → Webhook → FastAPI Endpoint → get_or_create_customer() → 
AI Agent → get_chat_response() → send_telegram_message() → Telegram
```

### Customer Identification
- **Primary ID**: `telegram_user_id` (unique numeric ID from Telegram)
- **Username**: Stored in `telegram_username` (optional, @username)
- **Phone**: Only if user shares it (optional)
- **Full Name**: Constructed from first_name + last_name

### Profile Picture Handling
- Fetched on customer creation only (not on every message)
- Uses Telegram Bot API `getUserProfilePhotos`
- Returns Telegram CDN URL (no need to store image)
- Graceful fallback if unavailable

## API Endpoint Details

### POST /api/v1/webhook/telegram

**Headers:**
- `X-Telegram-Bot-Api-Secret-Token` (optional) - Webhook secret verification

**Request Body:** Telegram Update object
```json
{
  "update_id": 123456789,
  "message": {
    "message_id": 1,
    "from": {
      "id": 123456789,
      "first_name": "John",
      "last_name": "Doe",
      "username": "johndoe"
    },
    "chat": {
      "id": 123456789,
      "type": "private"
    },
    "text": "Hello!"
  }
}
```

**Success Response:**
```json
{
  "status": "success",
  "customer_id": 42,
  "user_id": 123456789,
  "chat_id": 123456789,
  "username": "johndoe",
  "message": "Hello!",
  "reply": "Hi! How can I help you today?",
  "telegram_response": {
    "message_id": 2,
    "chat_id": 123456789
  }
}
```

## Testing

### Run Test Suite
```bash
python test_telegram_webhook.py
```

### Manual Testing with curl
```bash
# Simulate a Telegram update
curl -X POST http://localhost:8000/api/v1/webhook/telegram \
  -H "Content-Type: application/json" \
  -d '{
    "update_id": 123,
    "message": {
      "message_id": 1,
      "from": {"id": 123, "first_name": "Test", "username": "test"},
      "chat": {"id": 123, "type": "private"},
      "text": "Hello bot!"
    }
  }'
```

## Troubleshooting

### Webhook Not Receiving Messages
```bash
# Check webhook status
python setup_telegram_webhook.py info

# Common issues:
# - Webhook URL not publicly accessible
# - Certificate issues (use HTTPS)
# - Previous webhook still active
```

### Remove Old Webhook
```bash
python setup_telegram_webhook.py remove
```

### Check Bot Token
```bash
# Verify token works
curl https://api.telegram.org/bot{YOUR_TOKEN}/getMe
```

### Debug Mode
Enable debug logging in your FastAPI app to see webhook payloads:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Feature Comparison

| Feature | WhatsApp | Telegram | Email |
|---------|----------|----------|-------|
| Auto Customer Creation | ✅ | ✅ | ✅ |
| Profile Pictures | ✅ | ✅ | ❌ |
| Typing Indicators | ✅ | ✅ | ❌ |
| Conversation History | ✅ | ✅ | ✅ |
| Webhook-based | ✅ | ✅ | N/A |
| Identifier | Phone | User ID | Email |

## Next Steps

1. **Production Deployment:**
   - Use a proper domain with HTTPS
   - Set up monitoring for webhook failures
   - Configure rate limiting

2. **Enhanced Features:**
   - Support media messages (photos, documents)
   - Add inline keyboards for better UX
   - Implement message formatting (Markdown/HTML)
   - Add conversation context tracking

3. **Monitoring:**
   - Track webhook delivery failures
   - Monitor AI response times
   - Set up alerts for errors

## Files Modified/Created

### Created Files
- `app/services/telegram/webhook.py` - Telegram service functions
- `migrations/add_telegram_user_id.sql` - Database migration
- `setup_telegram_webhook.py` - Webhook setup script
- `test_telegram_webhook.py` - Test suite
- `TELEGRAM_INTEGRATION.md` - This documentation

### Modified Files
- `app/models/customers.py` - Added telegram_user_id field
- `app/core/config.py` - Added Telegram config settings
- `app/services/agent/main.py` - Updated get_or_create_customer()
- `app/api/v1/endpoints/webhooks.py` - Added /telegram endpoint

## Security Considerations

1. **Webhook Secret Token:**
   - Always use `TELEGRAM_WEBHOOK_SECRET` in production
   - Telegram sends this in `X-Telegram-Bot-Api-Secret-Token` header
   - Prevents unauthorized webhook calls

2. **Bot Token:**
   - Never commit bot token to version control
   - Store in environment variables only
   - Regenerate if compromised

3. **HTTPS Required:**
   - Telegram requires HTTPS for webhooks
   - Use valid SSL certificates (not self-signed)
   - Use ngrok for local development

## Support

For issues or questions:
- Check Telegram Bot API docs: https://core.telegram.org/bots/api
- Review server logs for errors
- Test with `setup_telegram_webhook.py info`
- Verify database has telegram_user_id column

---

**Status:** ✅ Fully Implemented and Tested
**Last Updated:** 2024-03-28
