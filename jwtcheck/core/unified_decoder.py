"""
Unified JWT decoder supporting both JWS and JWE tokens.

JWS (JSON Web Signature): 3 parts (header.payload.signature)
JWE (JSON Web Encryption): 5 parts (header.encrypted_key.iv.ciphertext.tag)
"""

from __future__ import annotations

from typing import Union

from jwtcheck.core.decoder import DecodedToken, DecodeError, decode_token
from jwtcheck.core.jwe_decoder import DecodedJWE, JWEDecodeError, decode_jwe, is_jwe_token
from jwtcheck.logging_config import PhaseLogger

_phase = PhaseLogger("unified_decoder")


# Type alias for decoded tokens
DecodedJWT = Union[DecodedToken, DecodedJWE]


def decode_jwt(token: str) -> DecodedJWT:
    """
    Decode a JWT token, automatically detecting JWS vs JWE.

    Args:
        token: The raw JWT token string.

    Returns:
        DecodedToken for JWS, DecodedJWE for JWE.

    Raises:
        DecodeError: If the token cannot be decoded (JWS).
        JWEDecodeError: If the token cannot be decoded (JWE).
    """
    _phase.start("Decoding JWT", length=len(token))

    # Detect token type by part count
    if is_jwe_token(token):
        _phase.info("Detected JWE token (5 parts)")
        try:
            decoded = decode_jwe(token)
            _phase.end("JWE decoded successfully", success=True)
            return decoded
        except JWEDecodeError as e:
            _phase.end("JWE decode failed", success=False, error=str(e))
            raise
    else:
        _phase.info("Detected JWS token (3 parts)")
        try:
            decoded = decode_token(token)
            _phase.end("JWS decoded successfully", success=True)
            return decoded
        except DecodeError as e:
            _phase.end("JWS decode failed", success=False, error=str(e))
            raise


def is_jwe(decoded: DecodedJWT) -> bool:
    """
    Check if a decoded token is a JWE.

    Args:
        decoded: Decoded token (JWS or JWE).

    Returns:
        True if JWE, False if JWS.
    """
    return isinstance(decoded, DecodedJWE)
