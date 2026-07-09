"""
Tests for active security checks.

Tests cover:
- Weak secret brute force detection
- Algorithm confusion probe (mocked)
- Safety gate validation
"""

import pytest

from jwtcheck.core.checks.active import (
    WeakSecretBruteforceCheck,
    AlgConfusionProbeCheck,
    run_all_active_checks,
    ACTIVE_CHECK_REGISTRY,
)
from jwtcheck.core.decoder import decode_token
from jwtcheck.core.findings import Severity
from jwtcheck.tests.fixtures.tokens import _make_token


class TestWeakSecretBruteforceCheck:
    """Tests for weak secret brute force detection."""

    def test_detects_weak_secret(self):
        """Should detect a token signed with 'secret'."""
        import hmac
        import hashlib
        import base64
        import json

        header = {"alg": "HS256", "typ": "JWT"}
        payload = {"sub": "1234567890", "name": "John Doe"}

        header_b64 = base64.urlsafe_b64encode(
            json.dumps(header).encode()
        ).rstrip(b"=").decode()
        payload_b64 = base64.urlsafe_b64encode(
            json.dumps(payload).encode()
        ).rstrip(b"=").decode()

        signing_input = f"{header_b64}.{payload_b64}".encode()
        signature = hmac.new(b"secret", signing_input, hashlib.sha256).digest()
        signature_b64 = base64.urlsafe_b64encode(signature).rstrip(b"=").decode()

        token_str = f"{header_b64}.{payload_b64}.{signature_b64}"
        token = decode_token(token_str)

        findings = WeakSecretBruteforceCheck().run(token)
        assert len(findings) == 1
        assert findings[0].severity == Severity.CRITICAL
        assert findings[0].check == "weak_secret_bruteforce"
        assert "secret" in findings[0].details

    def test_no_finding_for_strong_secret(self):
        """Should not find a match for a strong secret."""
        import hmac
        import hashlib
        import base64
        import json

        header = {"alg": "HS256", "typ": "JWT"}
        payload = {"sub": "1234567890"}

        header_b64 = base64.urlsafe_b64encode(
            json.dumps(header).encode()
        ).rstrip(b"=").decode()
        payload_b64 = base64.urlsafe_b64encode(
            json.dumps(payload).encode()
        ).rstrip(b"=").decode()

        strong_secret = "this_is_a_very_strong_secret_that_is_not_in_the_wordlist_1234567890"
        signing_input = f"{header_b64}.{payload_b64}".encode()
        signature = hmac.new(strong_secret.encode(), signing_input, hashlib.sha256).digest()
        signature_b64 = base64.urlsafe_b64encode(signature).rstrip(b"=").decode()

        token_str = f"{header_b64}.{payload_b64}.{signature_b64}"
        token = decode_token(token_str)

        findings = WeakSecretBruteforceCheck().run(token)
        assert len(findings) == 0

    def test_skips_non_hs256_tokens(self):
        """Should skip tokens that are not HS256."""
        token = decode_token(_make_token({"alg": "RS256"}, {"sub": "test"}))
        findings = WeakSecretBruteforceCheck().run(token)
        assert len(findings) == 0

    def test_remediation_present(self):
        """Findings should include remediation guidance."""
        import hmac
        import hashlib
        import base64
        import json

        header = {"alg": "HS256", "typ": "JWT"}
        payload = {"sub": "test"}

        header_b64 = base64.urlsafe_b64encode(
            json.dumps(header).encode()
        ).rstrip(b"=").decode()
        payload_b64 = base64.urlsafe_b64encode(
            json.dumps(payload).encode()
        ).rstrip(b"=").decode()

        signing_input = f"{header_b64}.{payload_b64}".encode()
        signature = hmac.new(b"password", signing_input, hashlib.sha256).digest()
        signature_b64 = base64.urlsafe_b64encode(signature).rstrip(b"=").decode()

        token_str = f"{header_b64}.{payload_b64}.{signature_b64}"
        token = decode_token(token_str)

        findings = WeakSecretBruteforceCheck().run(token)
        assert len(findings) == 1
        assert findings[0].remediation
        assert len(findings[0].remediation) > 20


class TestAlgConfusionProbeCheck:
    """Tests for algorithm confusion probe."""

    def test_requires_target(self):
        """Should return no findings if no target is provided."""
        token = decode_token(_make_token({"alg": "RS256"}, {"sub": "test"}))
        findings = AlgConfusionProbeCheck().run(token, target=None)
        assert len(findings) == 0

    def test_metadata_present(self):
        """Check should have complete metadata."""
        check = AlgConfusionProbeCheck()
        meta = check.metadata
        assert meta.name == "alg_confusion_probe"
        assert meta.description
        assert meta.category == "active"


class TestActiveCheckRegistry:
    """Tests for active check registry."""

    def test_all_checks_registered(self):
        """Both active checks should be in the registry."""
        assert len(ACTIVE_CHECK_REGISTRY) == 2

    @pytest.mark.parametrize("check", ACTIVE_CHECK_REGISTRY)
    def test_metadata_present(self, check):
        """Every check should have complete metadata."""
        meta = check.metadata
        assert meta.name
        assert meta.description
        assert meta.category
        assert meta.severity_hint


class TestRunAllActiveChecks:
    """Tests for run_all_active_checks orchestrator."""

    def test_returns_findings_sorted_by_severity(self):
        """Findings should be sorted by severity."""
        import hmac
        import hashlib
        import base64
        import json

        header = {"alg": "HS256", "typ": "JWT"}
        payload = {"sub": "test"}

        header_b64 = base64.urlsafe_b64encode(
            json.dumps(header).encode()
        ).rstrip(b"=").decode()
        payload_b64 = base64.urlsafe_b64encode(
            json.dumps(payload).encode()
        ).rstrip(b"=").decode()

        signing_input = f"{header_b64}.{payload_b64}".encode()
        signature = hmac.new(b"admin", signing_input, hashlib.sha256).digest()
        signature_b64 = base64.urlsafe_b64encode(signature).rstrip(b"=").decode()

        token_str = f"{header_b64}.{payload_b64}.{signature_b64}"
        token = decode_token(token_str)

        findings = run_all_active_checks(token, target=None)
        assert len(findings) >= 1
        if len(findings) > 1:
            for i in range(len(findings) - 1):
                assert findings[i].severity >= findings[i + 1].severity
