import httpx
import sys

sys.stdout.reconfigure(encoding='utf-8')

r = httpx.get('http://127.0.0.1:8000/api/v1/chat/customers/all')
customers = r.json()
target = next((c for c in customers if c['channel'] == 'whatsapp'), None)
if target:
    print("Found customer:", target['id'], target['phone_number'])
    resp = httpx.post(f"http://127.0.0.1:8000/api/v1/chat/{target['id']}/reply", json={"message": "Testing reply from CRM UI"}, timeout=40.0)
    print("Reply code:", resp.status_code)
    print("Reply data:", resp.json())
else:
    print("No whatsapp customer found")
