"""
Comprehensive tests for JWT decoder.

Tests cover:
- Valid token decoding
- Malformed token handling
- Edge cases (empty, wrong types, etc.)
"""

import pytest

from jwtcheck.core.decoder import DecodeError, decode_token
from jwtcheck.tests.fixtures.tokens import (
    GOLD_STANDARD_TOKEN,
    KNOWN_BAD_TOKENS,
    MALFORMED_TOKENS,
)


class TestDecodeValidTokens:
    """Test decoding of valid JWT tokens."""

    def test_gold_standard_decodes(self):
        """Gold standard token should decode successfully."""
        token = decode_token(GOLD_STANDARD_TOKEN)
        assert token.header["alg"] == "RS256"
        assert token.payload["sub"] == "1234567890"
        assert token.parts_count == 3

    def test_all_known_bad_tokens_decode(self):
        """All known-bad tokens should decode (they're structurally valid)."""
        for name, raw_token in KNOWN_BAD_TOKENS.items():
            token = decode_token(raw_token)
            assert token.header is not None, f"{name} failed to decode header"
            assert token.payload is not None, f"{name} failed to decode payload"

    def test_header_fields_accessible(self):
        """Header fields should be accessible via properties."""
        token = decode_token(GOLD_STANDARD_TOKEN)
        assert token.algorithm == "RS256"
        assert token.token_type == "JWT"
        assert token.kid is None

    def test_payload_claims_accessible(self):
        """Payload claims should be accessible."""
        token = decode_token(GOLD_STANDARD_TOKEN)
        assert "sub" in token.payload
        assert "exp" in token.payload
        assert "iat" in token.payload
        assert "iss" in token.payload
        assert "aud" in token.payload

    def test_signature_bytes_present(self):
        """Signature should be decoded to bytes."""
        token = decode_token(GOLD_STANDARD_TOKEN)
        assert isinstance(token.signature, bytes)
        assert len(token.signature) > 0


class TestDecodeMalformedTokens:
    """Test that malformed tokens raise DecodeError."""

    @pytest.mark.parametrize("name,raw_token", list(MALFORMED_TOKENS.items()))
    def test_malformed_token_raises(self, name, raw_token):
        """Each malformed token should raise DecodeError."""
        with pytest.raises(DecodeError):
            decode_token(raw_token)

    def test_empty_string_raises(self):
        """Empty string should raise DecodeError."""
        with pytest.raises(DecodeError, match="non-empty string"):
            decode_token("")

    def test_none_raises(self):
        """None should raise DecodeError."""
        with pytest.raises(DecodeError):
            decode_token(None)

    def test_wrong_parts_count(self):
        """Tokens with wrong number of parts should raise DecodeError."""
        with pytest.raises(DecodeError, match="expected 3"):
            decode_token("a.b")
        with pytest.raises(DecodeError, match="expected 3"):
            decode_token("a.b.c.d")

    def test_whitespace_stripped(self):
        """Leading/trailing whitespace should be stripped."""
        token = decode_token(f"  {GOLD_STANDARD_TOKEN}  ")
        assert token.algorithm == "RS256"


class TestDecodeEdgeCases:
    """Test edge cases in token decoding."""

    def test_empty_signature_allowed(self):
        """Tokens with empty signature segment should decode (e.g., alg: none)."""
        from jwtcheck.tests.fixtures.tokens import _make_token
        token_raw = _make_token({"alg": "none"}, {"sub": "test"}, b"")
        token = decode_token(token_raw)
        assert token.signature == b""

    def test_unicode_in_payload(self):
        """Unicode characters in payload should be handled."""
        from jwtcheck.tests.fixtures.tokens import _make_token
        token_raw = _make_token(
            {"alg": "HS256"},
            {"sub": "user", "name": "日本語テスト"},
        )
        token = decode_token(token_raw)
        assert token.payload["name"] == "日本語テスト"

    def test_numeric_claims(self):
        """Numeric claims should be preserved as numbers."""
        from jwtcheck.tests.fixtures.tokens import _make_token
        token_raw = _make_token(
            {"alg": "HS256"},
            {"sub": "user", "exp": 1700000000, "iat": 1699999000},
        )
        token = decode_token(token_raw)
        assert isinstance(token.payload["exp"], int)
        assert isinstance(token.payload["iat"], int)

    def test_nested_objects_in_payload(self):
        """Nested JSON objects should be preserved."""
        from jwtcheck.tests.fixtures.tokens import _make_token
        token_raw = _make_token(
            {"alg": "HS256"},
            {"sub": "user", "metadata": {"role": "admin", "level": 5}},
        )
        token = decode_token(token_raw)
        assert token.payload["metadata"]["role"] == "admin"
        assert token.payload["metadata"]["level"] == 5
