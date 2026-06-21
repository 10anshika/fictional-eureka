## How to Test the AI Tool

1. Run the backend server
2. Use this sample request (via Postman or curl):

POST /api/ai/classify

{
  "order_id": "ORD12345",
  "platform": "Shopify",
  "expected_amount": 2500.00,
  "actual_amount": 2480.00,
  "difference": -20.00,
  "notes": "Possible commission rate change during sale"
}

3. Check the structured response. This public demo endpoint is intentionally stateless.

---

### Practical Commands

**Start the backend (from repo root):**

```bash
pip install -r backend/requirements.txt
# No environment variables are needed for the deterministic classifier.
# Set LLM_API_KEY to use the configured LLM instead.
uvicorn backend.main:app --reload --port 8000
```

**Sample curl:**

```bash
curl -X POST http://localhost:8000/api/ai/classify \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "ORD12345",
    "platform": "Shopify",
    "expected_amount": 2500.00,
    "actual_amount": 2480.00,
    "difference": -20.00,
    "notes": "Possible commission rate change during sale"
  }'
```

**Notes:**
- The endpoint works with or without `LLM_API_KEY` (falls back to a deterministic demo classification).
- AI classification + confidence + explanation + suggested_action are returned in the response.
- The public endpoint does not access Supabase.
- Authenticated app users can persist classification with `POST /api/transactions/{transaction_id}/classify`.

### Automated checks

```bash
pip install -r backend/requirements-dev.txt
pytest
```
