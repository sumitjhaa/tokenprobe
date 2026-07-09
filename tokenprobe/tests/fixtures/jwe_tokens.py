"""
JWE test fixtures for testing JWE decoder and checks.

JWE tokens have 5 parts:
header.encrypted_key.iv.ciphertext.tag
"""

import base64
import json


def _b64encode(data: dict | bytes) -> str:
    """Base64url-encode data without padding."""
    if isinstance(data, dict):
        data = json.dumps(data, separators=(",", ":")).encode()
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def _make_jwe(
    header: dict,
    encrypted_key: bytes = b"fake_encrypted_key",
    iv: bytes = b"fake_iv_12345678",
    ciphertext: bytes = b"fake_ciphertext",
    tag: bytes = b"fake_auth_tag",
) -> str:
    """Build a JWE token string."""
    return (
        f"{_b64encode(header)}."
        f"{_b64encode(encrypted_key)}."
        f"{_b64encode(iv)}."
        f"{_b64encode(ciphertext)}."
        f"{_b64encode(tag)}"
    )


# Valid JWE with RSA-OAEP-256 (recommended)
JWE_RSA_OAEP_256 = _make_jwe(
    {"alg": "RSA-OAEP-256", "enc": "A256GCM", "typ": "JWE"},
)

# Valid JWE with ECDH-ES (recommended)
JWE_ECDH_ES = _make_jwe(
    {"alg": "ECDH-ES", "enc": "A256GCM", "typ": "JWE"},
)

# JWE with weak algorithm RSA1_5 (should be flagged)
JWE_WEAK_ALG_RSA15 = _make_jwe(
    {"alg": "RSA1_5", "enc": "A256GCM", "typ": "JWE"},
)

# JWE with weak algorithm RSA_OAEP (should be flagged)
JWE_WEAK_ALG_RSA_OAEP = _make_jwe(
    {"alg": "RSA_OAEP", "enc": "A256GCM", "typ": "JWE"},
)

# JWE with alg: none (critical issue)
JWE_ALG_NONE = _make_jwe(
    {"alg": "none", "enc": "A256GCM", "typ": "JWE"},
)

# JWE missing enc field (critical issue)
JWE_MISSING_ENC = _make_jwe(
    {"alg": "RSA-OAEP-256", "typ": "JWE"},
)

# JWE with weak encryption method A128CBC-HS256 (medium issue)
JWE_WEAK_ENC = _make_jwe(
    {"alg": "RSA-OAEP-256", "enc": "A128CBC-HS256", "typ": "JWE"},
)

# JWE with kid header
JWE_WITH_KID = _make_jwe(
    {"alg": "RSA-OAEP-256", "enc": "A256GCM", "typ": "JWE", "kid": "key-123"},
)

# JWE with multiple issues
JWE_MULTI_ISSUE = _make_jwe(
    {"alg": "RSA1_5", "enc": "A128CBC-HS256", "typ": "JWE"},
)

# Clean JWE (no issues)
JWE_GOLD_STANDARD = _make_jwe(
    {"alg": "RSA-OAEP-256", "enc": "A256GCM", "typ": "JWE", "kid": "production-key"},
)


# Registry for testing
JWE_KNOWN_BAD: dict[str, str] = {
    "weak_alg_rsa15": JWE_WEAK_ALG_RSA15,
    "weak_alg_rsa_oaep": JWE_WEAK_ALG_RSA_OAEP,
    "alg_none": JWE_ALG_NONE,
    "missing_enc": JWE_MISSING_ENC,
    "weak_enc": JWE_WEAK_ENC,
    "multi_issue": JWE_MULTI_ISSUE,
}

JWE_VALID: dict[str, str] = {
    "rsa_oaep_256": JWE_RSA_OAEP_256,
    "ecdh_es": JWE_ECDH_ES,
    "with_kid": JWE_WITH_KID,
    "gold_standard": JWE_GOLD_STANDARD,
}
