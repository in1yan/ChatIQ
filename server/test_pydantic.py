from datetime import datetime, timezone
import json
from pydantic_ai import ModelRequest, ModelResponse, ModelMessagesTypeAdapter, TextPart

def test():
    m = ModelResponse(parts=[TextPart(content=f"[AGENT] hello")], timestamp=datetime.now(timezone.utc))
    msg_data = ModelMessagesTypeAdapter.dump_json([m])
    print("DUMPED:", msg_data)
    
    parsed = ModelMessagesTypeAdapter.validate_json(msg_data)
    print("PARSED:", parsed)

    m = parsed[0]
    print("IS MODEL RESPONSE:", isinstance(m, ModelResponse))

if __name__ == "__main__":
    test()
