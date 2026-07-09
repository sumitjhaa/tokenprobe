"""
Comprehensive tests for all static security checks.

Tests cover:
- Each check triggers on its target token
- Each check does NOT trigger on the gold standard token
- Edge cases and boundary conditions
"""

import pytest

from jwtcheck.core.checks.static import (
    AlgNoneCheck,
    MissingExpCheck,
    LongLivedTokenCheck,
    MissingIatCheck,
    MissingAudCheck,
    MissingIssCheck,
    PiiInPayloadCheck,
    WeakAlgDeclaredCheck,
    run_all_static_checks,
    CHECK_REGISTRY,
)
from jwtcheck.core.decoder import decode_token
from jwtcheck.core.findings import Severity
from jwtcheck.tests.fixtures.tokens import (
    ALG_NONE_TOKEN,
    ALG_NONE_UPPER_TOKEN,
    ALG_NONE_CAPS_TOKEN,
    MISSING_EXP_TOKEN,
    LONG_LIVED_TOKEN,
    VERY_LONG_LIVED_TOKEN,
    MISSING_IAT_TOKEN,
    MISSING_AUD_TOKEN,
    MISSING_ISS_TOKEN,
    PII_PAYLOAD_TOKEN,
    ALG_CONFUSION_TOKEN,
    ALG_CONFUSION_JWK_TOKEN,
    MULTI_ISSUE_TOKEN,
    NESTED_PII_TOKEN,
    GOLD_STANDARD_TOKEN,
    _make_token,
)


class TestAlgNoneCheck:
    """Tests for alg: none detection."""

    def test_detects_alg_none(self):
        token = decode_token(ALG_NONE_TOKEN)
        findings = AlgNoneCheck().run(token)
        assert len(findings) == 1
        assert findings[0].severity == Severity.CRITICAL
        assert findings[0].check == "alg_none"

    def test_detects_alg_none_uppercase(self):
        token = decode_token(ALG_NONE_UPPER_TOKEN)
        findings = AlgNoneCheck().run(token)
        assert len(findings) == 1
        assert findings[0].severity == Severity.CRITICAL

    def test_detects_alg_none_all_caps(self):
        token = decode_token(ALG_NONE_CAPS_TOKEN)
        findings = AlgNoneCheck().run(token)
        assert len(findings) == 1
        assert findings[0].severity == Severity.CRITICAL

    def test_no_false_positive_on_hs256(self):
        token = decode_token(MISSING_EXP_TOKEN)  # Uses HS256
        findings = AlgNoneCheck().run(token)
        assert len(findings) == 0

    def test_no_false_positive_on_gold_standard(self):
        token = decode_token(GOLD_STANDARD_TOKEN)
        findings = AlgNoneCheck().run(token)
        assert len(findings) == 0

    def test_remediation_present(self):
        token = decode_token(ALG_NONE_TOKEN)
        findings = AlgNoneCheck().run(token)
        assert findings[0].remediation
        assert len(findings[0].remediation) > 20


class TestMissingExpCheck:
    """Tests for missing exp claim detection."""

    def test_detects_missing_exp(self):
        token = decode_token(MISSING_EXP_TOKEN)
        findings = MissingExpCheck().run(token)
        assert len(findings) == 1
        assert findings[0].severity == Severity.HIGH
        assert findings[0].check == "missing_exp"

    def test_no_false_positive_when_exp_present(self):
        token = decode_token(GOLD_STANDARD_TOKEN)
        findings = MissingExpCheck().run(token)
        assert len(findings) == 0

    def test_remediation_present(self):
        token = decode_token(MISSING_EXP_TOKEN)
        findings = MissingExpCheck().run(token)
        assert findings[0].remediation


class TestLongLivedTokenCheck:
    """Tests for long-lived token detection."""

    def test_detects_long_lived(self):
        token = decode_token(LONG_LIVED_TOKEN)
        findings = LongLivedTokenCheck().run(token)
        assert len(findings) == 1
        assert findings[0].severity == Severity.MEDIUM

    def test_detects_very_long_lived(self):
        token = decode_token(VERY_LONG_LIVED_TOKEN)
        findings = LongLivedTokenCheck().run(token)
        assert len(findings) == 1
        assert findings[0].severity == Severity.MEDIUM
        assert "30" in findings[0].details or "720" in findings[0].details

    def test_no_false_positive_on_short_lived(self):
        token = decode_token(GOLD_STANDARD_TOKEN)  # 1 hour validity
        findings = LongLivedTokenCheck().run(token)
        assert len(findings) == 0

    def test_no_finding_when_exp_or_iat_missing(self):
        token = decode_token(MISSING_EXP_TOKEN)  # Has iat but no exp
        findings = LongLivedTokenCheck().run(token)
        assert len(findings) == 0

    def test_exactly_24h_not_flagged(self):
        """Token with exactly 24h validity should NOT be flagged."""
        token_raw = _make_token(
            {"alg": "HS256"},
            {"iat": 1700000000, "exp": 1700000000 + 86400},
        )
        token = decode_token(token_raw)
        findings = LongLivedTokenCheck().run(token)
        assert len(findings) == 0

    def test_24h_plus_1_second_flagged(self):
        """Token with 24h + 1s validity should be flagged."""
        token_raw = _make_token(
            {"alg": "HS256"},
            {"iat": 1700000000, "exp": 1700000000 + 86401},
        )
        token = decode_token(token_raw)
        findings = LongLivedTokenCheck().run(token)
        assert len(findings) == 1


class TestMissingIatCheck:
    """Tests for missing iat claim detection."""

    def test_detects_missing_iat(self):
        token = decode_token(MISSING_IAT_TOKEN)
        findings = MissingIatCheck().run(token)
        assert len(findings) == 1
        assert findings[0].severity == Severity.LOW

    def test_no_false_positive_on_gold_standard(self):
        token = decode_token(GOLD_STANDARD_TOKEN)
        findings = MissingIatCheck().run(token)
        assert len(findings) == 0


class TestMissingAudCheck:
    """Tests for missing aud claim detection."""

    def test_detects_missing_aud(self):
        token = decode_token(MISSING_AUD_TOKEN)
        findings = MissingAudCheck().run(token)
        assert len(findings) == 1
        assert findings[0].severity == Severity.MEDIUM

    def test_no_false_positive_on_gold_standard(self):
        token = decode_token(GOLD_STANDARD_TOKEN)
        findings = MissingAudCheck().run(token)
        assert len(findings) == 0


class TestMissingIssCheck:
    """Tests for missing iss claim detection."""

    def test_detects_missing_iss(self):
        token = decode_token(MISSING_ISS_TOKEN)
        findings = MissingIssCheck().run(token)
        assert len(findings) == 1
        assert findings[0].severity == Severity.MEDIUM

    def test_no_false_positive_on_gold_standard(self):
        token = decode_token(GOLD_STANDARD_TOKEN)
        findings = MissingIssCheck().run(token)
        assert len(findings) == 0


class TestPiiInPayloadCheck:
    """Tests for PII detection in payload."""

    def test_detects_email(self):
        token = decode_token(PII_PAYLOAD_TOKEN)
        findings = PiiInPayloadCheck().run(token)
        assert len(findings) == 1
        assert findings[0].severity == Severity.INFO
        assert "email" in findings[0].details

    def test_detects_phone(self):
        token = decode_token(PII_PAYLOAD_TOKEN)
        findings = PiiInPayloadCheck().run(token)
        assert any("phone" in f.details for f in findings)

    def test_detects_nested_pii(self):
        token = decode_token(NESTED_PII_TOKEN)
        findings = PiiInPayloadCheck().run(token)
        assert len(findings) == 1
        assert "SSN" in findings[0].details or "email" in findings[0].details

    def test_no_false_positive_on_gold_standard(self):
        token = decode_token(GOLD_STANDARD_TOKEN)
        findings = PiiInPayloadCheck().run(token)
        assert len(findings) == 0

    def test_no_pii_in_clean_token(self):
        token_raw = _make_token(
            {"alg": "HS256"},
            {"sub": "user123", "role": "admin"},
        )
        token = decode_token(token_raw)
        findings = PiiInPayloadCheck().run(token)
        assert len(findings) == 0


class TestWeakAlgDeclaredCheck:
    """Tests for algorithm confusion detection."""

    def test_detects_hs256_with_x5c(self):
        token = decode_token(ALG_CONFUSION_TOKEN)
        findings = WeakAlgDeclaredCheck().run(token)
        assert len(findings) == 1
        assert findings[0].severity == Severity.HIGH
        assert "x5c" in findings[0].details

    def test_detects_hs256_with_jwk(self):
        token = decode_token(ALG_CONFUSION_JWK_TOKEN)
        findings = WeakAlgDeclaredCheck().run(token)
        assert len(findings) == 1
        assert findings[0].severity == Severity.HIGH
        assert "jwk" in findings[0].details

    def test_no_false_positive_on_clean_hs256(self):
        token = decode_token(MISSING_EXP_TOKEN)  # HS256 without x5c/jwk
        findings = WeakAlgDeclaredCheck().run(token)
        assert len(findings) == 0

    def test_no_false_positive_on_rs256(self):
        token = decode_token(GOLD_STANDARD_TOKEN)  # RS256
        findings = WeakAlgDeclaredCheck().run(token)
        assert len(findings) == 0


class TestMultiIssueToken:
    """Tests for tokens with multiple issues."""

    def test_multi_issue_triggers_multiple_checks(self):
        token = decode_token(MULTI_ISSUE_TOKEN)
        findings = run_all_static_checks(token)
        check_names = {f.check for f in findings}
        assert "alg_none" in check_names
        assert "missing_exp" in check_names
        assert "missing_iat" in check_names
        assert "missing_aud" in check_names
        assert "missing_iss" in check_names
        assert "pii_in_payload" in check_names

    def test_multi_issue_has_critical(self):
        token = decode_token(MULTI_ISSUE_TOKEN)
        findings = run_all_static_checks(token)
        critical = [f for f in findings if f.severity == Severity.CRITICAL]
        assert len(critical) >= 1


class TestRunAllStaticChecks:
    """Tests for the run_all_static_checks orchestrator."""

    def test_gold_standard_minimal_findings(self):
        """Gold standard should have zero Critical/High/Medium findings."""
        token = decode_token(GOLD_STANDARD_TOKEN)
        findings = run_all_static_checks(token)
        severe = [f for f in findings if f.severity in (Severity.CRITICAL, Severity.HIGH, Severity.MEDIUM)]
        assert len(severe) == 0

    def test_all_checks_registered(self):
        """All 8 P0 checks should be in the registry."""
        assert len(CHECK_REGISTRY) == 8

    def test_findings_sorted_by_severity(self):
        """Findings from run_all should be sorted most severe first."""
        token = decode_token(MULTI_ISSUE_TOKEN)
        findings = run_all_static_checks(token)
        if len(findings) > 1:
            for i in range(len(findings) - 1):
                assert findings[i].severity >= findings[i + 1].severity


class TestCheckMetadata:
    """Tests for check metadata completeness."""

    @pytest.mark.parametrize("check", CHECK_REGISTRY)
    def test_metadata_present(self, check):
        """Every check should have complete metadata."""
        meta = check.metadata
        assert meta.name
        assert meta.description
        assert meta.category
        assert meta.severity_hint

    @pytest.mark.parametrize("check", CHECK_REGISTRY)
    def test_findings_have_remediation(self, check):
        """Every finding should include remediation guidance."""
        token = decode_token(GOLD_STANDARD_TOKEN)
        findings = check.run(token)
        for f in findings:
            assert f.remediation, f"Finding from {f.check} missing remediation"
            assert len(f.remediation) > 10
