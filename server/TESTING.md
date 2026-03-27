# Chat Agent API Testing Guide

## Quick Start

### 1. Start the Server
```bash
cd server
uvicorn main:app --reload
```

### 2. Set OpenAI API Key (if testing with real AI)
```bash
# Windows PowerShell
$env:OPENAI_API_KEY="your-api-key-here"

# Windows CMD
set OPENAI_API_KEY=your-api-key-here

# Linux/Mac
export OPENAI_API_KEY=your-api-key-here
```

## Test Scripts

### Run Full Test Suite (Database + API)
```bash
python test_agent.py
```
This tests:
- Customer creation (WhatsApp/Telegram/Email)
- Message persistence
- Customer isolation
- API endpoints

### Run Manual API Tests
```bash
python test_api_manual.py
```
This tests live API with actual HTTP requests.

## Manual API Testing

### Test 1: WhatsApp Customer
```bash
# PowerShell
$body = @{
    prompt = "Hello, I need help with my order"
    phone_number = "+1234567890"
    channel = "whatsapp"
    customer_name = "John Doe"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/v1/chat/" -Method POST -Body $body -ContentType "application/json"
```

```bash
# curl (all platforms)
curl -X POST "http://localhost:8000/api/v1/chat/" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Hello, I need help with my order",
    "phone_number": "+1234567890",
    "channel": "whatsapp",
    "customer_name": "John Doe"
  }'
```

### Test 2: Email Customer
```bash
curl -X POST "http://localhost:8000/api/v1/chat/" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "How do I reset my password?",
    "email": "customer@example.com",
    "channel": "email",
    "customer_name": "Jane Smith"
  }'
```

### Test 3: Telegram Customer
```bash
curl -X POST "http://localhost:8000/api/v1/chat/" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What are your business hours?",
    "phone_number": "+9876543210",
    "channel": "telegram",
    "customer_name": "Bob Wilson",
    "telegram_username": "@bobwilson"
  }'
```

### Test 4: Get Customer Chat History
```bash
# Replace {customer_id} with actual ID from previous response headers
curl "http://localhost:8000/api/v1/chat/1"
```

```powershell
# PowerShell
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/chat/1"
```

## Response Format

### Streaming Response (POST /api/v1/chat/)
Newline-delimited JSON:
```json
{"role": "user", "timestamp": "2024-03-27T12:00:00", "content": "Hello"}
{"role": "model", "timestamp": "2024-03-27T12:00:01", "content": "Hi! How can I help?"}
```

### Response Headers
```
X-Customer-ID: 123
X-Customer-Channel: whatsapp
```

### Chat History Response (GET /api/v1/chat/{id})
Newline-delimited JSON with all messages:
```json
{"role": "user", "timestamp": "...", "content": "First message"}
{"role": "model", "timestamp": "...", "content": "AI response"}
{"role": "user", "timestamp": "...", "content": "Follow-up"}
{"role": "model", "timestamp": "...", "content": "AI response 2"}
```

## Testing Scenarios

### Scenario 1: New Customer (Auto-Creation)
1. Send message with new phone/email
2. Check response headers for X-Customer-ID
3. Verify customer was created in database

### Scenario 2: Existing Customer (Context)
1. Send first message from customer
2. Send follow-up message (same phone/email)
3. AI should have context from first message
4. Get history - should show both messages

### Scenario 3: Customer Isolation
1. Create customer A (phone: +1111111111)
2. Create customer B (phone: +2222222222)
3. Get history for A - should only show A's messages
4. Get history for B - should only show B's messages

### Scenario 4: Multi-Channel Same Info
What happens if same phone number used across channels?
- Each channel creates separate customer record
- This is by design for multi-channel support

## Database Inspection

### Check Customers
```sql
SELECT id, phone_number, email, channel, full_name, created_at 
FROM customers 
ORDER BY created_at DESC;
```

### Check Messages
```sql
SELECT m.id, m.customer_id, c.phone_number, c.email, c.channel, 
       m.created_at
FROM messages m
JOIN customers c ON m.customer_id = c.id
ORDER BY m.created_at DESC;
```

### Check Message Content
```sql
SELECT customer_id, message_data 
FROM messages 
WHERE customer_id = 1;
```

## Troubleshooting

### "OpenAI API key must be set"
- Set OPENAI_API_KEY environment variable before starting server
- Or add to .env file in server directory

### "Either phone_number or email must be provided"
- Request must include either `phone_number` OR `email`
- Cannot be both null

### "No module named 'pydantic_ai'"
```bash
cd server
uv sync
# or
pip install -r requirements.txt
```

### Database not initialized
```bash
python -c "from app.db.session import init_db; import asyncio; asyncio.run(init_db())"
```

## API Documentation

Access interactive API docs:
- Swagger UI: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc

## Expected Behavior

✅ **First message from new identifier**: Creates customer, saves message, returns AI response  
✅ **Follow-up from same identifier**: Retrieves customer, loads history, AI has context  
✅ **Different channels**: Each channel treated independently  
✅ **Streaming**: Response streams in real-time as AI generates  
✅ **Persistence**: All messages saved to PostgreSQL  
✅ **Isolation**: Customers only see their own messages  

## Performance Notes

- Customer lookup: Indexed on phone_number and email
- Message retrieval: Indexed on customer_id
- Streaming: Minimal latency with debounce_by=0.01s
- Database: Async operations throughout
