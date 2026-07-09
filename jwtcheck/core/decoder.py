"""
JWT token decoder — splits and decodes header/payload without verification.

This module provides safe, read-only decoding of JWT tokens for analysis.
It never verifies signatures — its purpose is to inspect token structure
and claims for misconfiguration auditing.
"""

from __future__ import annotations

import base64
import json
from dataclasses import dataclass
from typing import Any

from jwtcheck.logging_config import ErrorLogger, PhaseLogger

_phase = PhaseLogger("decoder")
_error = ErrorLogger("decoder")


class DecodeError(Exception):
    """Raised when a JWT token cannot be decoded."""
    pass


@dataclass
class DecodedToken:
    """
    Represents a decoded JWT token with its raw components.

    Attributes:
        raw: The original raw token string.
        header: Decoded header dictionary.
        payload: Decoded payload (claims) dictionary.
        signature: Raw signature bytes (not verified).
        header_b64: Base64-encoded header segment.
        payload_b64: Base64-encoded payload segment.
        signature_b64: Base64-encoded signature segment.
    """
    raw: str
    header: dict[str, Any]
    payload: dict[str, Any]
    signature: bytes
    header_b64: str
    payload_b64: str
    signature_b64: str

    @property
    def algorithm(self) -> str | None:
        """Get the algorithm from the header, if present."""
        return self.header.get("alg")

    @property
    def token_type(self) -> str | None:
        """Get the token type (typ) from the header."""
        return self.header.get("typ")

    @property
    def kid(self) -> str | None:
        """Get the Key ID from the header, if present."""
        return self.header.get("kid")

    @property
    def parts_count(self) -> int:
        """Number of dot-separated parts in the raw token."""
        return len(self.raw.split("."))


def _base64url_decode(data: str) -> bytes:
    """
    Decode base64url-encoded data with proper padding.

    Args:
        data: Base64url-encoded string.

    Returns:
        Decoded bytes.

    Raises:
        DecodeError: If the data cannot be decoded.
    """
    try:
        padding = 4 - len(data) % 4
        if padding != 4:
            data += "=" * padding
        return base64.urlsafe_b64decode(data)
    except Exception as e:
        raise DecodeError(f"Base64 decode failed: {e}") from e


def _decode_segment(segment: str) -> dict[str, Any]:
    """
    Decode a base64url-encoded JSON segment (header or payload).

    Args:
        segment: Base64url-encoded JSON string.

    Returns:
        Parsed dictionary.

    Raises:
        DecodeError: If segment is not valid base64url JSON.
    """
    raw_bytes = _base64url_decode(segment)
    try:
        parsed = json.loads(raw_bytes)
    except (json.JSONDecodeError, UnicodeDecodeError) as e:
        raise DecodeError(f"JSON decode failed: {e}") from e

    if not isinstance(parsed, dict):
        raise DecodeError(f"Expected JSON object, got {type(parsed).__name__}")

    return parsed


def decode_token(token: str) -> DecodedToken:
    """
    Decode a JWT token into its components without signature verification.

    This is a read-only operation — it does NOT verify the signature.
    It splits the token into header, payload, and signature segments,
    then decodes the header and payload from base64url-encoded JSON.

    Args:
        token: The raw JWT token string (three dot-separated base64url segments).

    Returns:
        DecodedToken with decoded header, payload, and raw signature bytes.

    Raises:
        DecodeError: If the token structure is invalid or segments cannot be decoded.
    """
    if not isinstance(token, str) or not token.strip():
        err = DecodeError("Token must be a non-empty string")
        _error.capture(err, context={"token_type": type(token).__name__})
        raise err

    token = token.strip()
    token_preview = token[:20] if len(token) > 20 else token
    _phase.start("Decoding JWT token", length=len(token), preview=token_preview)

    parts = token.split(".")

    if len(parts) != 3:
        err = DecodeError(
            f"Invalid JWT structure: expected 3 dot-separated parts, got {len(parts)}"
        )
        _error.capture(err, context={"parts_count": len(parts)})
        _phase.end("Invalid JWT structure", success=False, error=err)
        raise err

    header_b64, payload_b64, signature_b64 = parts

    try:
        header = _decode_segment(header_b64)
        _phase.info("Header decoded", keys=list(header.keys()))
    except DecodeError as e:
        _error.capture(e, context={"segment": "header"})
        _phase.end("Header decode failed", success=False, error=e)
        raise DecodeError(f"Invalid header: {e}") from e

    try:
        payload = _decode_segment(payload_b64)
        _phase.info("Payload decoded", keys=list(payload.keys()))
    except DecodeError as e:
        _error.capture(e, context={"segment": "payload"})
        _phase.end("Payload decode failed", success=False, error=e)
        raise DecodeError(f"Invalid payload: {e}") from e

    try:
        signature = _base64url_decode(signature_b64) if signature_b64 else b""
    except DecodeError as e:
        _error.capture(e, context={"segment": "signature"})
        _phase.end("Signature decode failed", success=False, error=e)
        raise DecodeError(f"Invalid signature: {e}") from e

    decoded = DecodedToken(
        raw=token,
        header=header,
        payload=payload,
        signature=signature,
        header_b64=header_b64,
        payload_b64=payload_b64,
        signature_b64=signature_b64,
    )

    _phase.end(
        "Token decoded successfully",
        success=True,
        algorithm=decoded.algorithm,
        claims_count=len(payload),
    )
    return decoded
