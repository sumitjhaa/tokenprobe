"""
Configuration management for custom claim requirements and check overrides.

Supports TOML config files for:
- Required claims validation
- Check disabling/enabling
- Severity overrides
- Custom pattern-based claim rules
"""

from __future__ import annotations

import re
import tomllib
from dataclasses import dataclass, field
from pathlib import Path

from tokenprobe.core.checks.engine import Check
from tokenprobe.core.decoder import DecodedToken
from tokenprobe.core.findings import CheckSource, Finding, Severity
from tokenprobe.logging_config import ErrorLogger, PhaseLogger

_phase = PhaseLogger("config")
_error = ErrorLogger("config")


@dataclass
class CustomRule:
    """Custom pattern-based claim validation rule."""

    name: str
    claim: str
    pattern: str
    severity: str = "medium"
    message: str = ""

    def __post_init__(self):
        if not self.message:
            self.message = f"Claim '{self.claim}' must match pattern: {self.pattern}"


@dataclass
class TokenProbeConfig:
    """Configuration for TokenProbe."""

    required_claims: list[str] = field(default_factory=list)
    disabled_checks: list[str] = field(default_factory=list)
    severity_overrides: dict[str, str] = field(default_factory=dict)
    custom_rules: list[CustomRule] = field(default_factory=list)

    def validate(self) -> list[str]:
        """Validate configuration and return list of errors."""
        errors = []

        valid_severities = {"critical", "high", "medium", "low", "info"}
        for check_name, severity in self.severity_overrides.items():
            if severity.lower() not in valid_severities:
                errors.append(
                    f"Invalid severity '{severity}' for check '{check_name}'. "
                    f"Must be one of: {', '.join(valid_severities)}"
                )

        for rule in self.custom_rules:
            try:
                re.compile(rule.pattern)
            except re.error as e:
                errors.append(f"Invalid regex pattern in rule '{rule.name}': {e}")

        return errors


def load_config(config_path: str | Path) -> TokenProbeConfig:
    """
    Load configuration from a TOML file.

    Args:
        config_path: Path to the TOML config file.

    Returns:
        TokenProbeConfig object.

    Raises:
        FileNotFoundError: If config file doesn't exist.
        ValueError: If config file is invalid.
    """
    _phase.start("Loading config", path=str(config_path))

    config_path = Path(config_path)
    if not config_path.exists():
        err = FileNotFoundError(f"Config file not found: {config_path}")
        _error.capture(err)
        _phase.end("Config file not found", success=False, error=err)
        raise err

    try:
        with open(config_path, "rb") as f:
            data = tomllib.load(f)
    except Exception as e:
        _error.capture(e, context={"path": str(config_path)})
        _phase.end("Config parse failed", success=False, error=e)
        raise ValueError(f"Invalid TOML config: {e}") from e

    config = TokenProbeConfig()

    if "claims" in data:
        claims = data["claims"]
        if "required" in claims:
            config.required_claims = claims["required"]

    if "checks" in data:
        checks = data["checks"]
        if "disable" in checks:
            config.disabled_checks = checks["disable"]

    if "severity_overrides" in data:
        config.severity_overrides = data["severity_overrides"]

    if "custom_rules" in data:
        for rule_data in data["custom_rules"]:
            rule = CustomRule(
                name=rule_data["name"],
                claim=rule_data["claim"],
                pattern=rule_data["pattern"],
                severity=rule_data.get("severity", "medium"),
                message=rule_data.get("message", ""),
            )
            config.custom_rules.append(rule)

    errors = config.validate()
    if errors:
        err_msg = "; ".join(errors)
        _phase.end("Config validation failed", success=False, errors=errors)
        raise ValueError(f"Invalid configuration: {err_msg}")

    _phase.end(
        "Config loaded",
        success=True,
        required_claims=len(config.required_claims),
        disabled_checks=len(config.disabled_checks),
        custom_rules=len(config.custom_rules),
    )
    return config


class RequiredClaimsCheck:
    """Check for custom required claims from config."""

    def __init__(self, required_claims: list[str]):
        self._required_claims = required_claims

    @property
    def name(self) -> str:
        return "custom_required_claims"

    @property
    def description(self) -> str:
        return f"Checks for required claims: {', '.join(self._required_claims)}"

    @property
    def category(self) -> str:
        return "custom"

    def run(self, token: DecodedToken, **context) -> list[Finding]:
        findings = []
        missing = [claim for claim in self._required_claims if claim not in token.payload]

        if missing:
            findings.append(
                Finding(
                    check=self.name,
                    severity=Severity.HIGH,
                    message=f"Missing required claims: {', '.join(missing)}",
                    remediation=f"Add the following claims to your token: {', '.join(missing)}",
                    source=CheckSource.STATIC,
                    details=f"Required: {', '.join(self._required_claims)}",
                )
            )

        return findings


class CustomPatternCheck:
    """Check for custom pattern-based claim validation."""

    def __init__(self, rule: CustomRule):
        self._rule = rule
        self._pattern = re.compile(rule.pattern)

    @property
    def name(self) -> str:
        return f"custom_rule_{self._rule.name}"

    @property
    def description(self) -> str:
        return self._rule.message

    @property
    def category(self) -> str:
        return "custom"

    def run(self, token: DecodedToken, **context) -> list[Finding]:
        findings = []
        claim_value = token.payload.get(self._rule.claim)

        if claim_value is None:
            return findings

        if not isinstance(claim_value, str):
            claim_value = str(claim_value)

        if not self._pattern.match(claim_value):
            severity_map = {
                "critical": Severity.CRITICAL,
                "high": Severity.HIGH,
                "medium": Severity.MEDIUM,
                "low": Severity.LOW,
                "info": Severity.INFO,
            }
            severity = severity_map.get(self._rule.severity.lower(), Severity.MEDIUM)

            findings.append(
                Finding(
                    check=self.name,
                    severity=severity,
                    message=self._rule.message,
                    remediation=f"Ensure claim '{self._rule.claim}' matches pattern: {self._rule.pattern}",
                    source=CheckSource.STATIC,
                    details=f"Actual value: {claim_value}",
                )
            )

        return findings


def build_config_checks(config: TokenProbeConfig) -> list[Check]:
    """
    Build check instances from configuration.

    Args:
        config: The configuration object.

    Returns:
        List of check instances.
    """
    checks: list[Check] = []

    if config.required_claims:
        checks.append(RequiredClaimsCheck(config.required_claims))

    for rule in config.custom_rules:
        checks.append(CustomPatternCheck(rule))

    return checks


def filter_checks_by_config(checks: list[Check], config: TokenProbeConfig) -> list[Check]:
    """
    Filter checks based on configuration (disable list).

    Args:
        checks: List of checks to filter.
        config: Configuration with disabled_checks list.

    Returns:
        Filtered list of checks.
    """
    if not config.disabled_checks:
        return checks

    return [check for check in checks if check.name not in config.disabled_checks]


def apply_severity_overrides(findings: list[Finding], config: TokenProbeConfig) -> list[Finding]:
    """
    Apply severity overrides from configuration.

    Args:
        findings: List of findings to modify.
        config: Configuration with severity_overrides.

    Returns:
        Modified list of findings.
    """
    if not config.severity_overrides:
        return findings

    severity_map = {
        "critical": Severity.CRITICAL,
        "high": Severity.HIGH,
        "medium": Severity.MEDIUM,
        "low": Severity.LOW,
        "info": Severity.INFO,
    }

    modified = []
    for finding in findings:
        if finding.check in config.severity_overrides:
            new_severity_str = config.severity_overrides[finding.check].lower()
            new_severity = severity_map.get(new_severity_str, finding.severity)

            modified_finding = Finding(
                check=finding.check,
                severity=new_severity,
                message=finding.message,
                remediation=finding.remediation,
                source=finding.source,
                details=finding.details,
            )
            modified.append(modified_finding)
        else:
            modified.append(finding)

    return modified
