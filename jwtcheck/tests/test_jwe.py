"""
Tests for JWE decoder and JWE-specific checks.

Tests cover:
- JWE token decoding (5-part structure)
- JWE header validation
- JWE-specific security checks
- Weak algorithm detection
- Missing encryption method detection
"""

import pytest

from jwtcheck.core.checks.engine import CheckExecutor
from jwtcheck.core.checks.jwe import (
    JWE_CHECKS,
    JWEAlgorithmNoneCheck,
    JWEMissingEncryptionCheck,
    JWEWeakAlgorithmCheck,
    JWEWeakEncryptionMethodCheck,
)
from jwtcheck.core.findings import Severity
from jwtcheck.core.jwe_decoder import JWEDecodeError, decode_jwe, is_jwe_token
from jwtcheck.tests.fixtures.jwe_tokens import (
    JWE_ALG_NONE,
    JWE_ECDH_ES,
    JWE_GOLD_STANDARD,
    JWE_MISSING_ENC,
    JWE_MULTI_ISSUE,
    JWE_RSA_OAEP_256,
    JWE_VALID,
    JWE_WEAK_ALG_RSA15,
    JWE_WEAK_ALG_RSA_OAEP,
    JWE_WEAK_ENC,
    JWE_WITH_KID,
)


class TestIsJweToken:
    """Tests for is_jwe_token function."""

    def test_detects_jwe_token(self):
        assert is_jwe_token(JWE_RSA_OAEP_256) is True

    def test_rejects_jws_token(self):
        jws_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U"
        assert is_jwe_token(jws_token) is False

    def test_rejects_invalid_token(self):
        assert is_jwe_token("invalid") is False
        assert is_jwe_token("a.b") is False
        assert is_jwe_token("a.b.c") is False


class TestDecodeJwe:
    """Tests for decode_jwe function."""

    def test_decode_valid_jwe(self):
        decoded = decode_jwe(JWE_RSA_OAEP_256)
        assert decoded.algorithm == "RSA-OAEP-256"
        assert decoded.encryption_method == "A256GCM"
        assert decoded.token_type == "JWE"
        assert decoded.is_jwe is True

    def test_decode_jwe_with_kid(self):
        decoded = decode_jwe(JWE_WITH_KID)
        assert decoded.kid == "key-123"

    def test_decode_jwe_ecdh_es(self):
        decoded = decode_jwe(JWE_ECDH_ES)
        assert decoded.algorithm == "ECDH-ES"

    def test_decode_invalid_structure_raises(self):
        with pytest.raises(JWEDecodeError, match="expected 5"):
            decode_jwe("a.b.c")

    def test_decode_empty_string_raises(self):
        with pytest.raises(JWEDecodeError, match="non-empty"):
            decode_jwe("")

    def test_decode_invalid_header_raises(self):
        with pytest.raises(JWEDecodeError):
            decode_jwe("not_base64.a.b.c.d")

    @pytest.mark.parametrize("name,token", list(JWE_VALID.items()))
    def test_all_valid_jwe_decode(self, name, token):
        """All valid JWE tokens should decode successfully."""
        decoded = decode_jwe(token)
        assert decoded.is_jwe is True
        assert decoded.header is not None


class TestJWEAlgorithmNoneCheck:
    """Tests for JWE alg: none detection."""

    def test_detects_alg_none(self):
        decoded = decode_jwe(JWE_ALG_NONE)
        findings = JWEAlgorithmNoneCheck().run(decoded)
        assert len(findings) == 1
        assert findings[0].severity == Severity.CRITICAL
        assert findings[0].check == "jwe_alg_none"

    def test_no_false_positive_on_valid_alg(self):
        decoded = decode_jwe(JWE_RSA_OAEP_256)
        findings = JWEAlgorithmNoneCheck().run(decoded)
        assert len(findings) == 0


class TestJWEWeakAlgorithmCheck:
    """Tests for weak algorithm detection."""

    def test_detects_rsa15(self):
        decoded = decode_jwe(JWE_WEAK_ALG_RSA15)
        findings = JWEWeakAlgorithmCheck().run(decoded)
        assert len(findings) == 1
        assert findings[0].severity == Severity.HIGH
        assert "RSA1_5" in findings[0].message

    def test_detects_rsa_oaep(self):
        decoded = decode_jwe(JWE_WEAK_ALG_RSA_OAEP)
        findings = JWEWeakAlgorithmCheck().run(decoded)
        assert len(findings) == 1
        assert findings[0].severity == Severity.HIGH

    def test_no_false_positive_on_strong_alg(self):
        decoded = decode_jwe(JWE_RSA_OAEP_256)
        findings = JWEWeakAlgorithmCheck().run(decoded)
        assert len(findings) == 0

    def test_no_false_positive_on_ecdh_es(self):
        decoded = decode_jwe(JWE_ECDH_ES)
        findings = JWEWeakAlgorithmCheck().run(decoded)
        assert len(findings) == 0


class TestJWEMissingEncryptionCheck:
    """Tests for missing encryption method detection."""

    def test_detects_missing_enc(self):
        decoded = decode_jwe(JWE_MISSING_ENC)
        findings = JWEMissingEncryptionCheck().run(decoded)
        assert len(findings) == 1
        assert findings[0].severity == Severity.CRITICAL
        assert findings[0].check == "jwe_missing_encryption"

    def test_no_false_positive_when_enc_present(self):
        decoded = decode_jwe(JWE_RSA_OAEP_256)
        findings = JWEMissingEncryptionCheck().run(decoded)
        assert len(findings) == 0


class TestJWEWeakEncryptionMethodCheck:
    """Tests for weak encryption method detection."""

    def test_detects_weak_enc_method(self):
        decoded = decode_jwe(JWE_WEAK_ENC)
        findings = JWEWeakEncryptionMethodCheck().run(decoded)
        assert len(findings) == 1
        assert findings[0].severity == Severity.MEDIUM
        assert "A128CBC-HS256" in findings[0].message

    def test_no_false_positive_on_strong_enc(self):
        decoded = decode_jwe(JWE_RSA_OAEP_256)
        findings = JWEWeakEncryptionMethodCheck().run(decoded)
        assert len(findings) == 0


class TestJWEMultiIssue:
    """Tests for JWE tokens with multiple issues."""

    def test_multi_issue_triggers_multiple_checks(self):
        decoded = decode_jwe(JWE_MULTI_ISSUE)
        executor = CheckExecutor(JWE_CHECKS)
        executor.execute_all(decoded)
        findings = executor.all_findings

        check_names = {f.check for f in findings}
        assert "jwe_weak_algorithm" in check_names
        assert "jwe_weak_encryption_method" in check_names

    def test_multi_issue_has_high_severity(self):
        decoded = decode_jwe(JWE_MULTI_ISSUE)
        executor = CheckExecutor(JWE_CHECKS)
        executor.execute_all(decoded)
        findings = executor.all_findings

        high_or_above = [f for f in findings if f.severity in (Severity.CRITICAL, Severity.HIGH)]
        assert len(high_or_above) >= 1


class TestAllJweChecks:
    """Tests for running all JWE checks together."""

    def test_gold_standard_no_findings(self):
        """Gold standard JWE should have no findings."""
        decoded = decode_jwe(JWE_GOLD_STANDARD)
        executor = CheckExecutor(JWE_CHECKS)
        executor.execute_all(decoded)
        findings = executor.all_findings

        critical_high = [f for f in findings if f.severity in (Severity.CRITICAL, Severity.HIGH)]
        assert len(critical_high) == 0

    def test_all_checks_registered(self):
        """All 4 JWE checks should be registered."""
        assert len(JWE_CHECKS) == 4

    @pytest.mark.parametrize("check", JWE_CHECKS)
    def test_all_checks_have_metadata(self, check):
        """Every JWE check should have complete metadata."""
        assert check.name
        assert check.description
        assert check.category == "jwe"

    @pytest.mark.parametrize("check", JWE_CHECKS)
    def test_all_checks_have_remediation(self, check):
        """Every finding should include remediation guidance."""
        decoded = decode_jwe(JWE_GOLD_STANDARD)
        findings = check.run(decoded)
        for f in findings:
            assert f.remediation
            assert len(f.remediation) > 10
