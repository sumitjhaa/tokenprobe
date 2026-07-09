"""
Test fixtures — hand-crafted JWT tokens for testing all checks.

Each fixture is a real JWT (base64url-encoded) that can be decoded by the decoder.
Tokens are NOT cryptographically valid — they're crafted to trigger specific checks.
"""

from __future__ import annotations

import base64
import json
from typing import Any


def _b64encode(data: dict | bytes) -> str:
    """Base64url-encode a dict (as JSON) or raw bytes, without padding."""
    if isinstance(data, dict):
        data = json.dumps(data, separators=(",", ":")).encode()
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def _make_token(header: dict, payload: dict, signature: bytes = b"fakesig") -> str:
    """Build a JWT string from header, payload, and signature bytes."""
    return f"{_b64encode(header)}.{_b64encode(payload)}.{_b64encode(signature)}"


# --- Known-bad tokens (each triggers a specific check) ---

# 1. alg: none — Critical
ALG_NONE_TOKEN = _make_token(
    {"alg": "none", "typ": "JWT"},
    {"sub": "1234567890", "name": "John Doe", "admin": True},
)

# 2. Missing exp — High
MISSING_EXP_TOKEN = _make_token(
    {"alg": "HS256", "typ": "JWT"},
    {"sub": "1234567890", "name": "John Doe", "iat": 1700000000},
)

# 3. Long-lived token (exp - iat > 24h) — Medium
LONG_LIVED_TOKEN = _make_token(
    {"alg": "RS256", "typ": "JWT"},
    {"sub": "1234567890", "iat": 1700000000, "exp": 1700200000},  # ~55 hours
)

# 4. Missing iat — Low
MISSING_IAT_TOKEN = _make_token(
    {"alg": "HS256", "typ": "JWT"},
    {"sub": "1234567890", "exp": 1700100000},
)

# 5. Missing aud — Medium
MISSING_AUD_TOKEN = _make_token(
    {"alg": "HS256", "typ": "JWT"},
    {"sub": "1234567890", "iat": 1700000000, "exp": 1700003600, "iss": "auth.example.com"},
)

# 6. Missing iss — Medium
MISSING_ISS_TOKEN = _make_token(
    {"alg": "HS256", "typ": "JWT"},
    {"sub": "1234567890", "iat": 1700000000, "exp": 1700003600, "aud": "api.example.com"},
)

# 7. PII in payload — Info
PII_PAYLOAD_TOKEN = _make_token(
    {"alg": "HS256", "typ": "JWT"},
    {
        "sub": "1234567890",
        "email": "john.doe@example.com",
        "phone": "+1-555-123-4567",
        "iat": 1700000000,
        "exp": 1700003600,
        "iss": "auth.example.com",
        "aud": "api.example.com",
    },
)

# 8. Algorithm confusion setup (HS256 + x5c) — High
ALG_CONFUSION_TOKEN = _make_token(
    {"alg": "HS256", "typ": "JWT", "x5c": ["MIIBIjANBg...fakecert"]},
    {"sub": "1234567890", "iat": 1700000000, "exp": 1700003600},
)

# 9. Multiple issues combined
MULTI_ISSUE_TOKEN = _make_token(
    {"alg": "none", "typ": "JWT"},
    {
        "sub": "1234567890",
        "email": "admin@corp.com",
    },
)

# 10. SSN in nested payload — Info
NESTED_PII_TOKEN = _make_token(
    {"alg": "HS256", "typ": "JWT"},
    {
        "sub": "1234567890",
        "user": {
            "name": "John",
            "ssn": "123-45-6789",
            "contact": {"email": "john@test.com"},
        },
        "iat": 1700000000,
        "exp": 1700003600,
        "iss": "auth.example.com",
        "aud": "api.example.com",
    },
)

# 11. Alg: None (uppercase) — Critical
ALG_NONE_UPPER_TOKEN = _make_token(
    {"alg": "None", "typ": "JWT"},
    {"sub": "1234567890", "iat": 1700000000, "exp": 1700003600},
)

# 12. Alg: NONE (all caps) — Critical
ALG_NONE_CAPS_TOKEN = _make_token(
    {"alg": "NONE", "typ": "JWT"},
    {"sub": "1234567890", "iat": 1700000000, "exp": 1700003600},
)

# 13. Algorithm confusion with jwk header — High
ALG_CONFUSION_JWK_TOKEN = _make_token(
    {"alg": "HS256", "typ": "JWT", "jwk": {"kty": "RSA", "n": "fake", "e": "AQAB"}},
    {"sub": "1234567890", "iat": 1700000000, "exp": 1700003600},
)

# 14. Very long-lived token (30 days) — Medium
VERY_LONG_LIVED_TOKEN = _make_token(
    {"alg": "RS256", "typ": "JWT"},
    {"sub": "1234567890", "iat": 1700000000, "exp": 1702592000},  # 30 days
)

# --- Known-good token (should produce zero Critical/High/Medium findings) ---

GOLD_STANDARD_TOKEN = _make_token(
    {"alg": "RS256", "typ": "JWT"},
    {
        "sub": "1234567890",
        "iat": 1700000000,
        "exp": 1700003600,  # 1 hour validity
        "iss": "auth.example.com",
        "aud": "api.example.com",
    },
)

# --- Malformed tokens (should fail decoding) ---

MALFORMED_NO_DOTS = "nodotsatall"
MALFORMED_ONE_DOT = "only.onedot"
MALFORMED_FOUR_PARTS = "a.b.c.d"
MALFORMED_BAD_BASE64 = "!!!.@@@.###"
MALFORMED_EMPTY = ""

# --- Registry for test iteration ---

KNOWN_BAD_TOKENS: dict[str, str] = {
    "alg_none": ALG_NONE_TOKEN,
    "alg_none_upper": ALG_NONE_UPPER_TOKEN,
    "alg_none_caps": ALG_NONE_CAPS_TOKEN,
    "missing_exp": MISSING_EXP_TOKEN,
    "long_lived": LONG_LIVED_TOKEN,
    "very_long_lived": VERY_LONG_LIVED_TOKEN,
    "missing_iat": MISSING_IAT_TOKEN,
    "missing_aud": MISSING_AUD_TOKEN,
    "missing_iss": MISSING_ISS_TOKEN,
    "pii_payload": PII_PAYLOAD_TOKEN,
    "alg_confusion_x5c": ALG_CONFUSION_TOKEN,
    "alg_confusion_jwk": ALG_CONFUSION_JWK_TOKEN,
    "multi_issue": MULTI_ISSUE_TOKEN,
    "nested_pii": NESTED_PII_TOKEN,
}

MALFORMED_TOKENS: dict[str, str] = {
    "no_dots": MALFORMED_NO_DOTS,
    "one_dot": MALFORMED_ONE_DOT,
    "four_parts": MALFORMED_FOUR_PARTS,
    "bad_base64": MALFORMED_BAD_BASE64,
    "empty": MALFORMED_EMPTY,
}
