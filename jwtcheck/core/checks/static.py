"""
Static security checks for JWT misconfiguration detection (P0).

All checks in this module are pure functions that analyze the decoded token
without making any network calls. They detect common JWT misconfigurations
like algorithm none, missing expiry, weak algorithms, and sensitive data exposure.
"""

from __future__ import annotations

import re
import time
from typing import Any

from jwtcheck.core.checks.base import CheckMetadata
from jwtcheck.core.decoder import DecodedToken
from jwtcheck.core.findings import CheckSource, Finding, Severity
from jwtcheck.logging_config import PhaseLogger

_phase = PhaseLogger("static_checks")

LONG_LIVED_THRESHOLD = 86400  # 24 hours in seconds

EMAIL_REGEX = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")
PHONE_REGEX = re.compile(r"(?:\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}")
SSN_REGEX = re.compile(r"\b\d{3}-\d{2}-\d{4}\b")


def _check_value_for_pii(value: Any, path: str = "") -> list[tuple[str, str]]:
    """
    Recursively check a value for PII patterns.

    Returns list of (path, pii_type) tuples.
    """
    findings = []

    if isinstance(value, str):
        if EMAIL_REGEX.search(value):
            findings.append((path or "root", "email"))
        if PHONE_REGEX.search(value):
            findings.append((path or "root", "phone"))
        if SSN_REGEX.search(value):
            findings.append((path or "root", "SSN"))
    elif isinstance(value, dict):
        for k, v in value.items():
            new_path = f"{path}.{k}" if path else k
            findings.extend(_check_value_for_pii(v, new_path))
    elif isinstance(value, list):
        for i, item in enumerate(value):
            new_path = f"{path}[{i}]"
            findings.extend(_check_value_for_pii(item, new_path))

    return findings


class AlgNoneCheck:
    """Check for alg: none — allows tokens without signature verification."""

    @property
    def metadata(self) -> CheckMetadata:
        return CheckMetadata(
            name="alg_none",
            description="Checks if algorithm is set to 'none', allowing unsigned tokens",
            category="algorithm",
            severity_hint="critical",
        )

    def run(self, token: DecodedToken) -> list[Finding]:
        _phase.check_start("alg_none")
        start_time = time.time()

        alg = token.algorithm
        findings = []

        if alg and alg.lower() == "none":
            findings.append(
                Finding(
                    check="alg_none",
                    severity=Severity.CRITICAL,
                    message="Token uses 'alg: none' — signature verification is bypassed",
                    remediation=(
                        "Reject tokens with 'alg: none'. Always enforce a specific algorithm "
                        "in your JWT library configuration (e.g., algorithms=['RS256'])."
                    ),
                    source=CheckSource.STATIC,
                    details=f"Header algorithm: {alg}",
                )
            )

        elapsed_ms = (time.time() - start_time) * 1000
        _phase.check_end("alg_none", len(findings), elapsed_ms)
        return findings


class MissingExpCheck:
    """Check for missing exp (expiration) claim."""

    @property
    def metadata(self) -> CheckMetadata:
        return CheckMetadata(
            name="missing_exp",
            description="Checks if the token has an expiration time",
            category="claims",
            severity_hint="high",
        )

    def run(self, token: DecodedToken) -> list[Finding]:
        _phase.check_start("missing_exp")
        start_time = time.time()

        findings = []

        if "exp" not in token.payload:
            findings.append(
                Finding(
                    check="missing_exp",
                    severity=Severity.HIGH,
                    message="Token has no expiration time (exp claim missing)",
                    remediation=(
                        "Always set an expiration time (exp claim) to limit token validity. "
                        "Recommended: 15-60 minutes for access tokens, 7-30 days for refresh tokens."
                    ),
                    source=CheckSource.STATIC,
                )
            )

        elapsed_ms = (time.time() - start_time) * 1000
        _phase.check_end("missing_exp", len(findings), elapsed_ms)
        return findings


class LongLivedTokenCheck:
    """Check for tokens with excessively long validity periods."""

    @property
    def metadata(self) -> CheckMetadata:
        return CheckMetadata(
            name="long_lived_token",
            description="Checks if token validity period exceeds 24 hours",
            category="claims",
            severity_hint="medium",
        )

    def run(self, token: DecodedToken) -> list[Finding]:
        _phase.check_start("long_lived_token")
        start_time = time.time()

        findings = []
        payload = token.payload

        exp = payload.get("exp")
        iat = payload.get("iat")

        if exp is not None and iat is not None:
            try:
                exp_int = int(exp)
                iat_int = int(iat)
                validity_period = exp_int - iat_int

                if validity_period > LONG_LIVED_THRESHOLD:
                    hours = validity_period / 3600
                    findings.append(
                        Finding(
                            check="long_lived_token",
                            severity=Severity.MEDIUM,
                            message=f"Token has long validity period: {hours:.1f} hours (>{LONG_LIVED_THRESHOLD // 3600}h)",
                            remediation=(
                                "Reduce token lifetime. Access tokens should be short-lived (15-60 min). "
                                "Use refresh tokens for longer sessions."
                            ),
                            source=CheckSource.STATIC,
                            details=f"Validity: {validity_period}s ({hours:.1f}h)",
                        )
                    )
            except (ValueError, TypeError):
                pass

        elapsed_ms = (time.time() - start_time) * 1000
        _phase.check_end("long_lived_token", len(findings), elapsed_ms)
        return findings


class MissingIatCheck:
    """Check for missing iat (issued at) claim."""

    @property
    def metadata(self) -> CheckMetadata:
        return CheckMetadata(
            name="missing_iat",
            description="Checks if the token has an issued-at timestamp",
            category="claims",
            severity_hint="low",
        )

    def run(self, token: DecodedToken) -> list[Finding]:
        _phase.check_start("missing_iat")
        start_time = time.time()

        findings = []

        if "iat" not in token.payload:
            findings.append(
                Finding(
                    check="missing_iat",
                    severity=Severity.LOW,
                    message="Token has no issued-at time (iat claim missing)",
                    remediation=(
                        "Include an iat (issued at) claim to track when tokens were created. "
                        "Useful for token rotation and revocation strategies."
                    ),
                    source=CheckSource.STATIC,
                )
            )

        elapsed_ms = (time.time() - start_time) * 1000
        _phase.check_end("missing_iat", len(findings), elapsed_ms)
        return findings


class MissingAudCheck:
    """Check for missing aud (audience) claim."""

    @property
    def metadata(self) -> CheckMetadata:
        return CheckMetadata(
            name="missing_aud",
            description="Checks if the token specifies intended audience",
            category="claims",
            severity_hint="medium",
        )

    def run(self, token: DecodedToken) -> list[Finding]:
        _phase.check_start("missing_aud")
        start_time = time.time()

        findings = []

        if "aud" not in token.payload:
            findings.append(
                Finding(
                    check="missing_aud",
                    severity=Severity.MEDIUM,
                    message="Token has no audience claim (aud missing)",
                    remediation=(
                        "Include an aud (audience) claim to restrict which services can accept the token. "
                        "Prevents token misuse across different services."
                    ),
                    source=CheckSource.STATIC,
                )
            )

        elapsed_ms = (time.time() - start_time) * 1000
        _phase.check_end("missing_aud", len(findings), elapsed_ms)
        return findings


class MissingIssCheck:
    """Check for missing iss (issuer) claim."""

    @property
    def metadata(self) -> CheckMetadata:
        return CheckMetadata(
            name="missing_iss",
            description="Checks if the token specifies its issuer",
            category="claims",
            severity_hint="medium",
        )

    def run(self, token: DecodedToken) -> list[Finding]:
        _phase.check_start("missing_iss")
        start_time = time.time()

        findings = []

        if "iss" not in token.payload:
            findings.append(
                Finding(
                    check="missing_iss",
                    severity=Severity.MEDIUM,
                    message="Token has no issuer claim (iss missing)",
                    remediation=(
                        "Include an iss (issuer) claim to identify who created the token. "
                        "Helps services verify the token came from a trusted source."
                    ),
                    source=CheckSource.STATIC,
                )
            )

        elapsed_ms = (time.time() - start_time) * 1000
        _phase.check_end("missing_iss", len(findings), elapsed_ms)
        return findings


class PiiInPayloadCheck:
    """Check for personally identifiable information in the payload."""

    @property
    def metadata(self) -> CheckMetadata:
        return CheckMetadata(
            name="pii_in_payload",
            description="Checks for email, phone, SSN, or other PII in token claims",
            category="privacy",
            severity_hint="info",
        )

    def run(self, token: DecodedToken) -> list[Finding]:
        _phase.check_start("pii_in_payload")
        start_time = time.time()

        findings = []
        pii_found = _check_value_for_pii(token.payload)

        if pii_found:
            pii_types = sorted(set(pii_type for _, pii_type in pii_found))
            pii_details = ", ".join(f"{path} ({pii_type})" for path, pii_type in pii_found)

            findings.append(
                Finding(
                    check="pii_in_payload",
                    severity=Severity.INFO,
                    message=f"Potential PII detected in payload: {', '.join(pii_types)}",
                    remediation=(
                        "Avoid storing PII in JWT tokens. Tokens are often logged or cached. "
                        "Use opaque identifiers and fetch PII from a secure backend service."
                    ),
                    source=CheckSource.STATIC,
                    details=f"PII locations: {pii_details}",
                )
            )

        elapsed_ms = (time.time() - start_time) * 1000
        _phase.check_end("pii_in_payload", len(findings), elapsed_ms)
        return findings


class WeakAlgDeclaredCheck:
    """Check for algorithm confusion setup (HS256 with x5c/jwk headers)."""

    @property
    def metadata(self) -> CheckMetadata:
        return CheckMetadata(
            name="weak_alg_declared",
            description="Checks for algorithm confusion vulnerability setup",
            category="algorithm",
            severity_hint="high",
        )

    def run(self, token: DecodedToken) -> list[Finding]:
        _phase.check_start("weak_alg_declared")
        start_time = time.time()

        findings = []
        alg = token.algorithm
        header = token.header

        if alg and alg.upper() == "HS256":
            has_x5c = "x5c" in header
            has_jwk = "jwk" in header

            if has_x5c or has_jwk:
                key_type = "x5c" if has_x5c else "jwk"
                findings.append(
                    Finding(
                        check="weak_alg_declared",
                        severity=Severity.HIGH,
                        message=f"Algorithm confusion risk: HS256 with {key_type} header present",
                        remediation=(
                            "Remove x5c/jwk headers when using HS256. These headers are meant for "
                            "asymmetric algorithms (RS256/ES256). Their presence with HS256 may indicate "
                            "an algorithm confusion attack setup."
                        ),
                        source=CheckSource.STATIC,
                        details=f"Header contains {key_type} with HS256 algorithm",
                    )
                )

        elapsed_ms = (time.time() - start_time) * 1000
        _phase.check_end("weak_alg_declared", len(findings), elapsed_ms)
        return findings


CHECK_REGISTRY: list = [
    AlgNoneCheck(),
    MissingExpCheck(),
    LongLivedTokenCheck(),
    MissingIatCheck(),
    MissingAudCheck(),
    MissingIssCheck(),
    PiiInPayloadCheck(),
    WeakAlgDeclaredCheck(),
]


def run_all_static_checks(token: DecodedToken) -> list[Finding]:
    """
    Run all registered static checks against a decoded token.

    Args:
        token: The decoded JWT token to analyze.

    Returns:
        Combined list of all findings from all checks.
    """
    _phase.start("Running all static checks", checks_count=len(CHECK_REGISTRY))

    all_findings = []
    for check in CHECK_REGISTRY:
        try:
            findings = check.run(token)
            all_findings.extend(findings)
        except Exception as e:
            from jwtcheck.logging_config import ErrorLogger
            error_logger = ErrorLogger("static_checks")
            error_logger.capture(e, context={"check": check.metadata.name})

    _phase.end("Static checks complete", success=True, total_findings=len(all_findings))
    all_findings.sort(key=lambda f: f.severity.weight, reverse=True)
    return all_findings
