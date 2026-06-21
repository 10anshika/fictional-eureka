import asyncio
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from backend.routes.ai import DiscrepancyData, _fallback_classification, classify_data, router
from backend.webhooks import run_org_sync, verify_shopify_signature


def discrepancy(notes: str, expected: float = 1_000, actual: float = 900) -> DiscrepancyData:
    return DiscrepancyData(
        order_id="ORDER-1",
        platform="shopify",
        expected_amount=expected,
        actual_amount=actual,
        difference=actual - expected,
        notes=notes,
    )


@pytest.mark.parametrize(
    ("notes", "expected_classification"),
    [
        ("Customer received a partial refund", "Partial Return"),
        ("GST amount differs from tax invoice", "GST Error"),
        ("Settlement pending until next cycle", "Timing Issue"),
        ("Commission rate changed", "Fee Mismatch"),
    ],
)
def test_deterministic_classifier_covers_core_patterns(notes, expected_classification):
    result = _fallback_classification(discrepancy(notes))
    assert result.classification == expected_classification
    assert 0 <= result.confidence <= 100
    assert result.explanation
    assert result.suggested_action


def test_classifier_uses_fallback_without_llm_key(monkeypatch):
    monkeypatch.delenv("LLM_API_KEY", raising=False)
    result = asyncio.run(classify_data(discrepancy("commission adjustment")))
    assert result.classification == "Fee Mismatch"
    assert result.processed_at.endswith("+00:00")


def test_public_classifier_endpoint_is_standalone(monkeypatch):
    monkeypatch.delenv("LLM_API_KEY", raising=False)
    app = FastAPI()
    app.include_router(router)
    response = TestClient(app).post("/api/ai/classify", json={
        "order_id": "ORDER-1",
        "platform": "Shopify",
        "expected_amount": 2500,
        "actual_amount": 2480,
        "difference": -20,
        "notes": "commission changed",
    })
    assert response.status_code == 200
    assert response.json()["classification"] == "Fee Mismatch"


def test_shopify_hmac_verification(monkeypatch):
    body = b'{"id": 1}'
    secret = "shopify-secret"
    import base64
    import hashlib
    import hmac

    signature = base64.b64encode(hmac.new(secret.encode(), body, hashlib.sha256).digest()).decode()
    assert verify_shopify_signature(body, signature, secret)
    assert not verify_shopify_signature(body, "invalid", secret)
    assert not verify_shopify_signature(body, signature, "")


def test_background_sync_awaits_orchestrator(monkeypatch):
    called = []

    class FakeOrchestrator:
        def __init__(self, org_id):
            self.org_id = org_id

        async def run(self):
            called.append(self.org_id)

    asyncio.run(run_org_sync("org-123", FakeOrchestrator))
    assert called == ["org-123"]
