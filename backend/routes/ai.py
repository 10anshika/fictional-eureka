"""AI-assisted discrepancy classification.

The public route is intentionally stateless so it is safe to use as a portfolio
demo. Database persistence is handled by the authenticated transaction route in
``backend.main`` where the organization boundary is known.
"""

import json
import logging
import os
from datetime import datetime, timezone
from typing import Literal

import httpx
from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter()
logger = logging.getLogger(__name__)

Classification = Literal[
    "Fee Mismatch",
    "Partial Return",
    "Timing Issue",
    "GST Error",
    "Other",
]


class DiscrepancyData(BaseModel):
    order_id: str = Field(min_length=1, max_length=200)
    platform: str = Field(min_length=1, max_length=50)
    expected_amount: float = Field(ge=0)
    actual_amount: float = Field(ge=0)
    difference: float
    notes: str = Field(default="", max_length=2_000)


class ClassificationResult(BaseModel):
    classification: Classification
    confidence: int = Field(ge=0, le=100)
    explanation: str = Field(min_length=1, max_length=1_000)
    suggested_action: str = Field(min_length=1, max_length=1_000)
    processed_at: str


def _fallback_classification(data: DiscrepancyData) -> ClassificationResult:
    """Deterministic domain fallback used when no LLM is configured."""
    notes = data.notes.lower()
    difference = data.actual_amount - data.expected_amount
    absolute_difference = abs(difference)
    difference_pct = absolute_difference / data.expected_amount if data.expected_amount else 0

    if any(term in notes for term in ("partial return", "partial refund", "returned item")):
        classification: Classification = "Partial Return"
        confidence = 88
        explanation = "The transaction notes indicate a partial return or refund against the original order."
        action = "Match returned line items with the gateway refund and verify the remaining settled amount."
    elif any(term in notes for term in ("gst", "tax", "itc")):
        classification = "GST Error"
        confidence = 86
        explanation = "The discrepancy appears related to GST, tax, or input-tax-credit treatment."
        action = "Compare the platform tax invoice with gateway fee and GST entries before claiming ITC."
    elif any(term in notes for term in ("pending", "delay", "timing", "settlement cycle")):
        classification = "Timing Issue"
        confidence = 84
        explanation = "The available context points to a settlement or refund timing difference."
        action = "Recheck after the next settlement cycle and escalate only if the entry remains unmatched."
    elif any(term in notes for term in ("fee", "commission", "mdr", "sale")) or (
        difference < 0 and difference_pct <= 0.10
    ):
        classification = "Fee Mismatch"
        confidence = 82
        explanation = (
            f"The settlement is lower than expected by {absolute_difference:.2f}, "
            "which is consistent with a fee or commission adjustment."
        )
        action = "Compare the contracted fee rate with the platform and gateway settlement breakdown."
    else:
        classification = "Other"
        confidence = 55
        explanation = "The supplied data does not match a high-confidence reconciliation pattern."
        action = "Review the order, payment, refund, and settlement records together before adjusting accounts."

    return ClassificationResult(
        classification=classification,
        confidence=confidence,
        explanation=explanation,
        suggested_action=action,
        processed_at=datetime.now(timezone.utc).isoformat(),
    )


def _extract_json(content: str) -> dict:
    content = content.strip()
    if content.startswith("```"):
        content = content.removeprefix("```json").removeprefix("```")
        content = content.removesuffix("```").strip()
    return json.loads(content)


async def classify_data(data: DiscrepancyData) -> ClassificationResult:
    api_key = os.getenv("LLM_API_KEY")
    if not api_key:
        return _fallback_classification(data)

    prompt = f"""You are an expert in Indian D2C and quick-commerce reconciliation.
Classify the discrepancy as exactly one of: Fee Mismatch, Partial Return, Timing Issue, GST Error, Other.
Return JSON with classification, confidence (0-100), explanation, and suggested_action.

Order ID: {data.order_id}
Platform: {data.platform}
Expected amount: {data.expected_amount:.2f}
Actual amount: {data.actual_amount:.2f}
Calculated difference: {data.actual_amount - data.expected_amount:.2f}
Notes: {data.notes}
"""

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {api_key}"},
                json={
                    "model": os.getenv("LLM_MODEL", "gpt-4o-mini"),
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.2,
                    "response_format": {"type": "json_object"},
                },
            )
            response.raise_for_status()
            payload = _extract_json(response.json()["choices"][0]["message"]["content"])
            payload["processed_at"] = datetime.now(timezone.utc).isoformat()
            return ClassificationResult.model_validate(payload)
    except (httpx.HTTPError, KeyError, TypeError, ValueError, json.JSONDecodeError):
        logger.warning("LLM classification failed; using deterministic fallback", exc_info=True)
        return _fallback_classification(data)


@router.post("/api/ai/classify", response_model=ClassificationResult)
async def classify_discrepancy(data: DiscrepancyData) -> ClassificationResult:
    """Return a classification without reading or writing application data."""
    return await classify_data(data)
