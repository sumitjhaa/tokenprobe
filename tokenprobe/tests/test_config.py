"""
Tests for configuration management.

Tests cover:
- TOML config loading
- Custom required claims
- Check disabling
- Severity overrides
- Custom pattern rules
"""

import tempfile
from pathlib import Path

import pytest

from tokenprobe.core.config import (
    CustomPatternCheck,
    CustomRule,
    RequiredClaimsCheck,
    TokenProbeConfig,
    apply_severity_overrides,
    build_config_checks,
    filter_checks_by_config,
    load_config,
)
from tokenprobe.core.decoder import decode_token
from tokenprobe.core.findings import Finding, Severity
from tokenprobe.tests.fixtures.tokens import GOLD_STANDARD_TOKEN, _make_token


class TestTokenProbeConfig:
    """Tests for TokenProbeConfig dataclass."""

    def test_default_config(self):
        config = TokenProbeConfig()
        assert config.required_claims == []
        assert config.disabled_checks == []
        assert config.severity_overrides == {}
        assert config.custom_rules == []

    def test_validate_valid_config(self):
        config = TokenProbeConfig(
            required_claims=["sub", "exp"],
            severity_overrides={"missing_exp": "critical"},
        )
        errors = config.validate()
        assert errors == []

    def test_validate_invalid_severity(self):
        config = TokenProbeConfig(
            severity_overrides={"missing_exp": "invalid_severity"},
        )
        errors = config.validate()
        assert len(errors) == 1
        assert "Invalid severity" in errors[0]

    def test_validate_invalid_regex(self):
        config = TokenProbeConfig(
            custom_rules=[
                CustomRule(
                    name="bad_regex",
                    claim="sub",
                    pattern="[invalid",
                )
            ],
        )
        errors = config.validate()
        assert len(errors) == 1
        assert "Invalid regex" in errors[0]


class TestLoadConfig:
    """Tests for load_config function."""

    def test_load_valid_config(self):
        config_content = """
[claims]
required = ["sub", "exp", "iat"]

[checks]
disable = ["pii_in_payload"]

[severity_overrides]
missing_exp = "critical"

[[custom_rules]]
name = "sub_format"
claim = "sub"
pattern = "^[a-z]+$"
severity = "high"
message = "Subject must be lowercase"
"""
        with tempfile.NamedTemporaryFile(mode="w", suffix=".toml", delete=False) as f:
            f.write(config_content)
            f.flush()
            config = load_config(f.name)

        assert config.required_claims == ["sub", "exp", "iat"]
        assert config.disabled_checks == ["pii_in_payload"]
        assert config.severity_overrides == {"missing_exp": "critical"}
        assert len(config.custom_rules) == 1
        assert config.custom_rules[0].name == "sub_format"

        Path(f.name).unlink()

    def test_load_nonexistent_file(self):
        with pytest.raises(FileNotFoundError):
            load_config("/nonexistent/config.toml")

    def test_load_invalid_toml(self):
        with tempfile.NamedTemporaryFile(mode="w", suffix=".toml", delete=False) as f:
            f.write("invalid toml [[[")
            f.flush()
            with pytest.raises(ValueError, match="Invalid TOML"):
                load_config(f.name)
            Path(f.name).unlink()


class TestRequiredClaimsCheck:
    """Tests for RequiredClaimsCheck."""

    def test_all_required_present(self):
        token = decode_token(GOLD_STANDARD_TOKEN)
        check = RequiredClaimsCheck(["sub", "exp", "iat"])
        findings = check.run(token)
        assert len(findings) == 0

    def test_missing_required_claims(self):
        token_raw = _make_token(
            {"alg": "HS256"},
            {"sub": "test"},  # Missing exp, iat
        )
        token = decode_token(token_raw)
        check = RequiredClaimsCheck(["sub", "exp", "iat"])
        findings = check.run(token)
        assert len(findings) == 1
        assert findings[0].severity == Severity.HIGH
        assert "exp" in findings[0].message
        assert "iat" in findings[0].message

    def test_metadata(self):
        check = RequiredClaimsCheck(["sub", "exp"])
        assert check.name == "custom_required_claims"
        assert check.category == "custom"
        assert "sub" in check.description


class TestCustomPatternCheck:
    """Tests for CustomPatternCheck."""

    def test_pattern_matches(self):
        token_raw = _make_token(
            {"alg": "HS256"},
            {"sub": "abc123"},
        )
        token = decode_token(token_raw)
        rule = CustomRule(
            name="sub_format",
            claim="sub",
            pattern="^[a-z0-9]+$",
            severity="high",
            message="Subject must be alphanumeric lowercase",
        )
        check = CustomPatternCheck(rule)
        findings = check.run(token)
        assert len(findings) == 0

    def test_pattern_no_match(self):
        token_raw = _make_token(
            {"alg": "HS256"},
            {"sub": "ABC-123"},
        )
        token = decode_token(token_raw)
        rule = CustomRule(
            name="sub_format",
            claim="sub",
            pattern="^[a-z0-9]+$",
            severity="high",
            message="Subject must be alphanumeric lowercase",
        )
        check = CustomPatternCheck(rule)
        findings = check.run(token)
        assert len(findings) == 1
        assert findings[0].severity == Severity.HIGH
        assert "ABC-123" in findings[0].details

    def test_claim_not_present(self):
        token_raw = _make_token(
            {"alg": "HS256"},
            {"other": "value"},
        )
        token = decode_token(token_raw)
        rule = CustomRule(
            name="sub_format",
            claim="sub",
            pattern="^[a-z]+$",
        )
        check = CustomPatternCheck(rule)
        findings = check.run(token)
        assert len(findings) == 0  # No finding if claim not present

    def test_severity_mapping(self):
        token_raw = _make_token(
            {"alg": "HS256"},
            {"sub": "INVALID"},
        )
        token = decode_token(token_raw)

        for severity_str, expected_severity in [
            ("critical", Severity.CRITICAL),
            ("high", Severity.HIGH),
            ("medium", Severity.MEDIUM),
            ("low", Severity.LOW),
            ("info", Severity.INFO),
        ]:
            rule = CustomRule(
                name="test",
                claim="sub",
                pattern="^[a-z]+$",
                severity=severity_str,
            )
            check = CustomPatternCheck(rule)
            findings = check.run(token)
            assert findings[0].severity == expected_severity


class TestBuildConfigChecks:
    """Tests for build_config_checks function."""

    def test_build_with_required_claims(self):
        config = TokenProbeConfig(required_claims=["sub", "exp"])
        checks = build_config_checks(config)
        assert len(checks) == 1
        assert checks[0].name == "custom_required_claims"

    def test_build_with_custom_rules(self):
        config = TokenProbeConfig(
            custom_rules=[
                CustomRule(name="rule1", claim="sub", pattern=".*"),
                CustomRule(name="rule2", claim="role", pattern=".*"),
            ]
        )
        checks = build_config_checks(config)
        assert len(checks) == 2
        assert checks[0].name == "custom_rule_rule1"
        assert checks[1].name == "custom_rule_rule2"

    def test_build_empty_config(self):
        config = TokenProbeConfig()
        checks = build_config_checks(config)
        assert len(checks) == 0


class TestFilterChecksByConfig:
    """Tests for filter_checks_by_config function."""

    def test_filter_disabled_checks(self):
        from tokenprobe.core.checks.static import STATIC_CHECKS

        config = TokenProbeConfig(disabled_checks=["pii_in_payload", "missing_iat"])
        filtered = filter_checks_by_config(STATIC_CHECKS, config)
        check_names = [c.name for c in filtered]
        assert "pii_in_payload" not in check_names
        assert "missing_iat" not in check_names
        assert "alg_none" in check_names

    def test_no_filter_without_disabled(self):
        from tokenprobe.core.checks.static import STATIC_CHECKS

        config = TokenProbeConfig()
        filtered = filter_checks_by_config(STATIC_CHECKS, config)
        assert len(filtered) == len(STATIC_CHECKS)


class TestApplySeverityOverrides:
    """Tests for apply_severity_overrides function."""

    def test_override_severity(self):
        findings = [
            Finding(
                check="missing_exp",
                severity=Severity.HIGH,
                message="Missing exp",
                remediation="Add exp",
            )
        ]
        config = TokenProbeConfig(severity_overrides={"missing_exp": "critical"})
        modified = apply_severity_overrides(findings, config)
        assert modified[0].severity == Severity.CRITICAL

    def test_no_override_for_unmatched(self):
        findings = [
            Finding(
                check="missing_exp",
                severity=Severity.HIGH,
                message="Missing exp",
                remediation="Add exp",
            )
        ]
        config = TokenProbeConfig(severity_overrides={"other_check": "critical"})
        modified = apply_severity_overrides(findings, config)
        assert modified[0].severity == Severity.HIGH

    def test_redos_pattern_rejected(self):
        with pytest.raises(ValueError, match="nested quantifiers"):
            config = TokenProbeConfig()
            config.custom_rules = [
                CustomRule(name="evil", claim="sub", pattern=r"(([a-z]+)+)$", severity="high"),
            ]
            errors = config.validate()
            if errors:
                raise ValueError(errors[0])

    def test_pattern_length_limit(self):
        config = TokenProbeConfig()
        config.custom_rules = [
            CustomRule(name="long", claim="sub", pattern="x" * 201, severity="high"),
        ]
        errors = config.validate()
        assert any("too long" in e for e in errors)

    def test_path_traversal_blocked(self):
        from tokenprobe.core.validation import ValidationError, validate_file_path
        with pytest.raises(ValidationError, match="Path traversal"):
            validate_file_path("../../etc/shadow")

    def test_no_override_without_config(self):
        findings = [
            Finding(
                check="missing_exp",
                severity=Severity.HIGH,
                message="Missing exp",
                remediation="Add exp",
            )
        ]
        config = TokenProbeConfig()
        modified = apply_severity_overrides(findings, config)
        assert modified[0].severity == Severity.HIGH
