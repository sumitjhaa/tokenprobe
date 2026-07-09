"""
Static security checks for JWT misconfiguration detection.

All checks are pure functions with no side effects.
Each check is isolated - errors in one don't affect others.
"""

from __future__ import annotations

import re
from typing import Any

from tokenprobe.core.checks.engine import Check
from tokenprobe.core.decoder import DecodedToken
from tokenprobe.core.findings import CheckSource, Finding, Severity
from tokenprobe.logging_config import PhaseLogger

_phase = PhaseLogger("static_checks")

LONG_LIVED_THRESHOLD = 86400

EMAIL_REGEX = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")
PHONE_REGEX = re.compile(r"(?:\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}")
SSN_REGEX = re.compile(r"\b\d{3}-\d{2}-\d{4}\b")


def _check_value_for_pii(value: Any, path: str = "") -> list[tuple[str, str]]:
    """Recursively check a value for PII patterns."""
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
    """Check for alg: none algorithm."""

    @property
    def name(self) -> str:
        return "alg_none"

    @property
    def description(self) -> str:
        return "Detects tokens using 'alg: none' which bypasses signature verification"

    @property
    def category(self) -> str:
        return "algorithm"

    def run(self, token: DecodedToken, **context) -> list[Finding]:
        alg = token.algorithm
        if alg and alg.lower() == "none":
            return [
                Finding(
                    check=self.name,
                    severity=Severity.CRITICAL,
                    message="Token uses 'alg: none' — signature verification is bypassed",
                    remediation=(
                        "Reject tokens with 'alg: none'. Enforce a specific algorithm "
                        "in your JWT library (e.g., algorithms=['RS256'])."
                    ),
                    source=CheckSource.STATIC,
                    details=f"Header algorithm: {alg}",
                )
            ]
        return []


class MissingExpCheck:
    """Check for missing exp claim."""

    @property
    def name(self) -> str:
        return "missing_exp"

    @property
    def description(self) -> str:
        return "Detects tokens without expiration time"

    @property
    def category(self) -> str:
        return "claims"

    def run(self, token: DecodedToken, **context) -> list[Finding]:
        if "exp" not in token.payload:
            return [
                Finding(
                    check=self.name,
                    severity=Severity.HIGH,
                    message="Token has no expiration time (exp claim missing)",
                    remediation=(
                        "Set an expiration time (exp claim). "
                        "Recommended: 15-60 minutes for access tokens."
                    ),
                    source=CheckSource.STATIC,
                )
            ]
        return []


class LongLivedTokenCheck:
    """Check for excessively long token validity."""

    @property
    def name(self) -> str:
        return "long_lived_token"

    @property
    def description(self) -> str:
        return "Detects tokens with validity period exceeding 24 hours"

    @property
    def category(self) -> str:
        return "claims"

    def run(self, token: DecodedToken, **context) -> list[Finding]:
        exp = token.payload.get("exp")
        iat = token.payload.get("iat")

        if exp is not None and iat is not None:
            try:
                validity = int(exp) - int(iat)
                if validity > LONG_LIVED_THRESHOLD:
                    hours = validity / 3600
                    return [
                        Finding(
                            check=self.name,
                            severity=Severity.MEDIUM,
                            message=f"Token validity: {hours:.1f} hours (>{LONG_LIVED_THRESHOLD // 3600}h)",
                            remediation=(
                                "Reduce token lifetime. Access tokens should be short-lived (15-60 min). "
                                "Use refresh tokens for longer sessions."
                            ),
                            source=CheckSource.STATIC,
                            details=f"Validity: {validity}s ({hours:.1f}h)",
                        )
                    ]
            except (ValueError, TypeError):
                pass

        return []


class MissingIatCheck:
    """Check for missing iat claim."""

    @property
    def name(self) -> str:
        return "missing_iat"

    @property
    def description(self) -> str:
        return "Detects tokens without issued-at timestamp"

    @property
    def category(self) -> str:
        return "claims"

    def run(self, token: DecodedToken, **context) -> list[Finding]:
        if "iat" not in token.payload:
            return [
                Finding(
                    check=self.name,
                    severity=Severity.LOW,
                    message="Token has no issued-at time (iat claim missing)",
                    remediation=(
                        "Include an iat claim to track token creation time. "
                        "Useful for rotation and revocation strategies."
                    ),
                    source=CheckSource.STATIC,
                )
            ]
        return []


class MissingAudCheck:
    """Check for missing aud claim."""

    @property
    def name(self) -> str:
        return "missing_aud"

    @property
    def description(self) -> str:
        return "Detects tokens without audience restriction"

    @property
    def category(self) -> str:
        return "claims"

    def run(self, token: DecodedToken, **context) -> list[Finding]:
        if "aud" not in token.payload:
            return [
                Finding(
                    check=self.name,
                    severity=Severity.MEDIUM,
                    message="Token has no audience claim (aud missing)",
                    remediation=(
                        "Include an aud claim to restrict which services accept the token. "
                        "Prevents token misuse across services."
                    ),
                    source=CheckSource.STATIC,
                )
            ]
        return []


class MissingIssCheck:
    """Check for missing iss claim."""

    @property
    def name(self) -> str:
        return "missing_iss"

    @property
    def description(self) -> str:
        return "Detects tokens without issuer identification"

    @property
    def category(self) -> str:
        return "claims"

    def run(self, token: DecodedToken, **context) -> list[Finding]:
        if "iss" not in token.payload:
            return [
                Finding(
                    check=self.name,
                    severity=Severity.MEDIUM,
                    message="Token has no issuer claim (iss missing)",
                    remediation=(
                        "Include an iss claim to identify the token creator. "
                        "Helps verify the token came from a trusted source."
                    ),
                    source=CheckSource.STATIC,
                )
            ]
        return []


class PiiInPayloadCheck:
    """Check for PII in token payload."""

    @property
    def name(self) -> str:
        return "pii_in_payload"

    @property
    def description(self) -> str:
        return "Detects personally identifiable information in token claims"

    @property
    def category(self) -> str:
        return "privacy"

    def run(self, token: DecodedToken, **context) -> list[Finding]:
        pii_found = _check_value_for_pii(token.payload)

        if pii_found:
            pii_types = sorted(set(pii_type for _, pii_type in pii_found))
            pii_details = ", ".join(f"{path} ({pii_type})" for path, pii_type in pii_found)

            return [
                Finding(
                    check=self.name,
                    severity=Severity.INFO,
                    message=f"Potential PII detected: {', '.join(pii_types)}",
                    remediation=(
                        "Avoid storing PII in JWT tokens. Use opaque identifiers "
                        "and fetch PII from a secure backend service."
                    ),
                    source=CheckSource.STATIC,
                    details=f"Locations: {pii_details}",
                )
            ]
        return []


class WeakAlgDeclaredCheck:
    """Check for algorithm confusion setup."""

    @property
    def name(self) -> str:
        return "weak_alg_declared"

    @property
    def description(self) -> str:
        return "Detects algorithm confusion vulnerability setup"

    @property
    def category(self) -> str:
        return "algorithm"

    def run(self, token: DecodedToken, **context) -> list[Finding]:
        alg = token.algorithm
        header = token.header

        if alg and alg.upper() == "HS256":
            has_x5c = "x5c" in header
            has_jwk = "jwk" in header

            if has_x5c or has_jwk:
                key_type = "x5c" if has_x5c else "jwk"
                return [
                    Finding(
                        check=self.name,
                        severity=Severity.HIGH,
                        message=f"Algorithm confusion risk: HS256 with {key_type} header",
                        remediation=(
                            "Remove x5c/jwk headers when using HS256. "
                            "These are for asymmetric algorithms (RS256/ES256)."
                        ),
                        source=CheckSource.STATIC,
                        details=f"Header contains {key_type} with HS256",
                    )
                ]

        return []


STATIC_CHECKS: list[Check] = [
    AlgNoneCheck(),
    MissingExpCheck(),
    LongLivedTokenCheck(),
    MissingIatCheck(),
    MissingAudCheck(),
    MissingIssCheck(),
    PiiInPayloadCheck(),
    WeakAlgDeclaredCheck(),
]
