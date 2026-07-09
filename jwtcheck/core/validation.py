"""
Input validation and sanitization for security.

Ensures all inputs are properly validated before processing
to prevent injection attacks and information leakage.
"""

from __future__ import annotations

import re
from typing import Any

from jwtcheck.logging_config import ErrorLogger

_error = ErrorLogger("validation")

MAX_TOKEN_LENGTH = 10000
MAX_CLAIM_KEY_LENGTH = 100
MAX_CLAIM_VALUE_LENGTH = 1000


class ValidationError(Exception):
    """Raised when input validation fails."""
    pass


def validate_token_format(token: str) -> str:
    """
    Validate and sanitize JWT token format.

    Args:
        token: Raw token string.

    Returns:
        Sanitized token string.

    Raises:
        ValidationError: If token is invalid.
    """
    if not isinstance(token, str):
        raise ValidationError(f"Token must be string, got {type(token).__name__}")

    token = token.strip()

    if not token:
        raise ValidationError("Token is empty")

    if len(token) > MAX_TOKEN_LENGTH:
        raise ValidationError(
            f"Token too long ({len(token)} chars, max {MAX_TOKEN_LENGTH})"
        )

    parts = token.split(".")
    if len(parts) != 3:
        raise ValidationError(
            f"Invalid JWT structure: expected 3 parts, got {len(parts)}"
        )

    for i, part in enumerate(parts[:2]):
        if not part:
            raise ValidationError(f"Part {i+1} is empty")
        if not re.match(r'^[A-Za-z0-9_-]+$', part):
            raise ValidationError(
                f"Part {i+1} contains invalid characters"
            )

    if parts[2] and not re.match(r'^[A-Za-z0-9_-]+$', parts[2]):
        raise ValidationError("Signature contains invalid characters")

    return token


def validate_url(url: str) -> str:
    """
    Validate URL format for target endpoints.

    Args:
        url: URL string.

    Returns:
        Sanitized URL.

    Raises:
        ValidationError: If URL is invalid.
    """
    if not isinstance(url, str):
        raise ValidationError(f"URL must be string, got {type(url).__name__}")

    url = url.strip()

    if not url:
        raise ValidationError("URL is empty")

    if not re.match(r'^https?://', url):
        raise ValidationError("URL must start with http:// or https://")

    if len(url) > 2000:
        raise ValidationError(f"URL too long ({len(url)} chars)")

    return url


def validate_claim_key(key: str) -> str:
    """
    Validate JWT claim key.

    Args:
        key: Claim key string.

    Returns:
        Sanitized key.

    Raises:
        ValidationError: If key is invalid.
    """
    if not isinstance(key, str):
        raise ValidationError(f"Claim key must be string, got {type(key).__name__}")

    key = key.strip()

    if not key:
        raise ValidationError("Claim key is empty")

    if len(key) > MAX_CLAIM_KEY_LENGTH:
        raise ValidationError(
            f"Claim key too long ({len(key)} chars, max {MAX_CLAIM_KEY_LENGTH})"
        )

    return key


def sanitize_for_logging(value: Any, max_length: int = 50) -> str:
    """
    Sanitize a value for safe logging.

    Prevents information leakage by truncating and escaping.

    Args:
        value: Value to sanitize.
        max_length: Maximum length before truncation.

    Returns:
        Sanitized string safe for logging.
    """
    if value is None:
        return "None"

    str_value = str(value)

    str_value = str_value.replace("\n", "\\n").replace("\r", "\\r")
    str_value = str_value.replace("\t", "\\t")

    if len(str_value) > max_length:
        str_value = str_value[:max_length] + "..."

    return str_value


def validate_secret(secret: str) -> str:
    """
    Validate a secret for brute force checking.

    Args:
        secret: Secret string.

    Returns:
        Validated secret.

    Raises:
        ValidationError: If secret is invalid.
    """
    if not isinstance(secret, str):
        raise ValidationError(f"Secret must be string, got {type(secret).__name__}")

    if not secret:
        raise ValidationError("Secret is empty")

    if len(secret) > 1000:
        raise ValidationError(f"Secret too long ({len(secret)} chars)")

    return secret


def validate_file_path(path: str) -> str:
    """
    Validate file path to prevent path traversal.

    Args:
        path: File path string.

    Returns:
        Validated path.

    Raises:
        ValidationError: If path is invalid or potentially malicious.
    """
    if not isinstance(path, str):
        raise ValidationError(f"Path must be string, got {type(path).__name__}")

    path = path.strip()

    if not path:
        raise ValidationError("Path is empty")

    if ".." in path:
        raise ValidationError("Path traversal not allowed")

    if path.startswith("~"):
        raise ValidationError("Home directory expansion not allowed")

    return path
