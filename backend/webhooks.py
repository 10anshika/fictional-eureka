"""Dependency-light webhook security and execution helpers."""

import base64
import hashlib
import hmac
from collections.abc import Callable
from typing import Any


def verify_shopify_signature(body: bytes, signature: str, secret: str) -> bool:
    if not secret or not signature:
        return False
    digest = hmac.new(secret.encode("utf-8"), body, hashlib.sha256).digest()
    expected = base64.b64encode(digest).decode()
    return hmac.compare_digest(expected, signature)


def verify_razorpay_signature(body: bytes, signature: str, secret: str) -> bool:
    if not secret or not signature:
        return False
    expected = hmac.new(
        secret.encode("utf-8"), body, hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature)


async def run_org_sync(org_id: str, orchestrator_factory: Callable[[str], Any]) -> None:
    """Construct and await an organization sync orchestrator."""
    await orchestrator_factory(org_id).run()
