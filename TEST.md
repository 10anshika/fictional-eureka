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

3. Check the response and database for saved AI classification.

---

### Practical Commands

**Start the backend (from repo root):**

```bash
cd backend
pip install -r requirements.txt
# Set env vars as needed (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and optionally LLM_API_KEY)
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
- If a reconciled transaction with matching `shopify_order_id` exists in the database, the AI fields are also written to that row.
- You can verify saved data via the `/api/transactions` endpoint (after auth) or directly in Supabase.
