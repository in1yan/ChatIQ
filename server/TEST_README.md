# Testing the Multi-Channel Chat Agent

## Quick Test Guide

### Option 1: Automated Test Suite (Recommended)
Tests database functions and API endpoints comprehensively.

```bash
# Make sure you're in the server directory
cd server

# Run the test suite
python test_agent.py
```

**What it tests:**
- ✅ Customer creation (WhatsApp, Telegram, Email)
- ✅ Duplicate customer handling
- ✅ Message persistence
- ✅ Message retrieval
- ✅ Customer isolation (privacy)
- ✅ API endpoints (if server is running)

### Option 2: Manual API Testing
Tests the live API with real HTTP requests.

```bash
# Make sure server is running first!
uvicorn main:app --reload

# In another terminal:
python test_api_manual.py
```

**What it tests:**
- ✅ WhatsApp customer flow
- ✅ Email customer flow
- ✅ Telegram customer flow
- ✅ Conversation continuation with context

### Option 3: Manual curl Commands
For quick one-off tests:

```bash
# Test WhatsApp customer
curl -X POST "http://localhost:8000/api/v1/chat/" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Hello!","phone_number":"+1234567890","channel":"whatsapp","customer_name":"Test User"}'

# Get chat history (replace 1 with actual customer_id)
curl "http://localhost:8000/api/v1/chat/1"
```

See [TESTING.md](TESTING.md) for more curl examples.

## Before Running Tests

### 1. Install Dependencies
```bash
uv sync
# or
pip install -r requirements.txt
```

### 2. Initialize Database
```bash
python -c "from app.db.session import init_db; import asyncio; asyncio.run(init_db())"
```

### 3. (Optional) Set OpenAI API Key
Only needed if testing with actual AI responses:
```bash
# Windows PowerShell
$env:OPENAI_API_KEY="sk-..."

# Linux/Mac
export OPENAI_API_KEY="sk-..."
```

Without the API key, tests will pass but AI responses won't work.

## Test Results

### Expected Output (test_agent.py)
```
🧪 MULTI-CHANNEL CUSTOMER SUPPORT AGENT TEST SUITE
============================================================

🔧 Initializing database...
✅ Database initialized

🧹 Cleaning up test data...
✅ Test data cleaned

============================================================
📦 TESTING SERVICE FUNCTIONS
============================================================

📱 Test 1: Create customer from WhatsApp
✅ Created customer: ID=1, Phone=+1234567890

📧 Test 2: Create customer from Email
✅ Created customer: ID=2, Email=test@example.com

💬 Test 3: Create customer from Telegram
✅ Created customer: ID=3, Telegram=@bobjohnson

🔍 Test 4: Get existing customer (no duplicate)
✅ Retrieved existing customer: ID=1

💾 Test 5: Save and retrieve messages for customer 1
✅ Saved 2 messages
✅ Retrieved 2 messages from database

🔒 Test 6: Customer message isolation
✅ Customer 1 has 2 messages
✅ Customer 2 has 0 messages
✅ Customers have isolated message histories

🎉 ALL TESTS COMPLETED!
```

## Troubleshooting

### Import Errors
```bash
cd server
uv sync
```

### Database Errors
```bash
python -c "from app.db.session import init_db; import asyncio; asyncio.run(init_db())"
```

### API Connection Errors
Make sure server is running:
```bash
uvicorn main:app --reload
```

### OpenAI API Errors
Set the API key or the AI agent won't work:
```bash
export OPENAI_API_KEY="your-key-here"
```

## What Gets Tested

### Database Layer
- [x] Customer model with multi-channel support
- [x] Message model with customer relationship
- [x] Auto-creation of customers
- [x] Conversation isolation
- [x] JSONB storage for messages

### Service Layer
- [x] `get_or_create_customer()` function
- [x] `get_customer_messages()` function
- [x] `save_messages()` function
- [x] `stream_chat_response()` function

### API Layer
- [x] POST /api/v1/chat/ endpoint
- [x] GET /api/v1/chat/{customer_id} endpoint
- [x] Request validation
- [x] Response streaming

## Next Steps After Testing

1. **Configure webhooks** from WhatsApp/Telegram/Email to POST /api/v1/chat/
2. **Add business logic** to the agent (custom prompts, tools, etc.)
3. **Monitor usage** via logs and database queries
4. **Scale** with load balancing if needed

For detailed testing commands and scenarios, see [TESTING.md](TESTING.md)
