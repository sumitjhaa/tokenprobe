"""
JWE (JSON Web Encryption) token decoder.

JWE tokens have 5 parts:
1. Header (base64url-encoded JSON, NOT encrypted)
2. Encrypted Key (base64url-encoded)
3. Initialization Vector (base64url-encoded)
4. Ciphertext (base64url-encoded, encrypted payload)
5. Authentication Tag (base64url-encoded)

This module decodes the header and provides basic structure validation.
Payload checks are skipped since the payload is encrypted.
"""

from __future__ import annotations

import base64
import json
from dataclasses import dataclass
from typing import Any

from jwtcheck.core.validation import ValidationError, validate_token_format
from jwtcheck.logging_config import ErrorLogger, PhaseLogger

_phase = PhaseLogger("jwe_decoder")
_error = ErrorLogger("jwe_decoder")


class JWEDecodeError(Exception):
    """Raised when a JWE token cannot be decoded."""
    pass


@dataclass
class DecodedJWE:
    """
    Represents a decoded JWE token.

    Only the header is decoded - the payload is encrypted.
    """

    raw: str
    header: dict[str, Any]
    header_b64: str
    encrypted_key_b64: str
    iv_b64: str
    ciphertext_b64: str
    tag_b64: str

    @property
    def algorithm(self) -> str | None:
        """Get the encryption algorithm from the header."""
        return self.header.get("alg")

    @property
    def encryption_method(self) -> str | None:
        """Get the content encryption method from the header."""
        return self.header.get("enc")

    @property
    def token_type(self) -> str | None:
        """Get the token type (typ) from the header."""
        return self.header.get("typ")

    @property
    def kid(self) -> str | None:
        """Get the Key ID from the header, if present."""
        return self.header.get("kid")

    @property
    def is_jwe(self) -> bool:
        """Confirm this is a JWE token."""
        return True


def _base64url_decode(data: str) -> bytes:
    """
    Decode base64url-encoded data with proper padding.

    Args:
        data: Base64url-encoded string.

    Returns:
        Decoded bytes.

    Raises:
        JWEDecodeError: If the data cannot be decoded.
    """
    try:
        padding = 4 - len(data) % 4
        if padding != 4:
            data += "=" * padding
        return base64.urlsafe_b64decode(data)
    except Exception as e:
        raise JWEDecodeError(f"Base64 decode failed: {e}") from e


def _decode_header(header_b64: str) -> dict[str, Any]:
    """
    Decode the JWE header.

    Args:
        header_b64: Base64url-encoded header.

    Returns:
        Parsed header dictionary.

    Raises:
        JWEDecodeError: If header cannot be decoded.
    """
    try:
        raw_bytes = _base64url_decode(header_b64)
        header = json.loads(raw_bytes)
    except Exception as e:
        raise JWEDecodeError(f"Header decode failed: {e}") from e

    if not isinstance(header, dict):
        raise JWEDecodeError(f"Header must be a JSON object, got {type(header).__name__}")

    return header


def is_jwe_token(token: str) -> bool:
    """
    Check if a token is a JWE (5-part) token.

    Args:
        token: The token string.

    Returns:
        True if token has 5 parts (JWE), False otherwise.
    """
    return len(token.split(".")) == 5


def decode_jwe(token: str) -> DecodedJWE:
    """
    Decode a JWE token.

    Only the header is decoded. The payload is encrypted and cannot be
    analyzed without the decryption key.

    Args:
        token: The raw JWE token string (5 dot-separated parts).

    Returns:
        DecodedJWE with decoded header and raw encrypted components.

    Raises:
        JWEDecodeError: If the token structure is invalid.
    """
    _phase.start("Decoding JWE token", length=len(token))

    # Validate basic structure
    if not isinstance(token, str) or not token.strip():
        err = JWEDecodeError("Token must be a non-empty string")
        _error.capture(err)
        _phase.end("Token is empty or not a string", success=False, error=err)
        raise err

    token = token.strip()
    parts = token.split(".")

    if len(parts) != 5:
        err = JWEDecodeError(
            f"Invalid JWE structure: expected 5 dot-separated parts, got {len(parts)}"
        )
        _error.capture(err, context={"parts_count": len(parts)})
        _phase.end("Invalid JWE structure", success=False, error=err)
        raise err

    header_b64, encrypted_key_b64, iv_b64, ciphertext_b64, tag_b64 = parts

    # Decode header
    try:
        header = _decode_header(header_b64)
        _phase.info("JWE Header decoded", keys=list(header.keys()))
    except JWEDecodeError as e:
        _error.capture(e, context={"segment": "header"})
        _phase.end("Header decode failed", success=False, error=e)
        raise

    # Validate required JWE header fields
    if "enc" not in header:
        _phase.info("Warning: JWE header missing 'enc' field")

    decoded = DecodedJWE(
        raw=token,
        header=header,
        header_b64=header_b64,
        encrypted_key_b64=encrypted_key_b64,
        iv_b64=iv_b64,
        ciphertext_b64=ciphertext_b64,
        tag_b64=tag_b64,
    )

    _phase.end(
        "JWE token decoded successfully",
        success=True,
        algorithm=decoded.algorithm,
        encryption=decoded.encryption_method,
    )
    return decoded
