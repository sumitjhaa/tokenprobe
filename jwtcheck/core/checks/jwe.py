"""
JWE-specific security checks.

Since JWE payloads are encrypted, these checks focus on the header
and encryption configuration.
"""

from __future__ import annotations

from jwtcheck.core.checks.engine import Check
from jwtcheck.core.findings import CheckSource, Finding, Severity
from jwtcheck.core.jwe_decoder import DecodedJWE
from jwtcheck.logging_config import PhaseLogger

_phase = PhaseLogger("jwe_checks")

# Weak encryption algorithms that should be flagged
WEAK_ALGORITHMS = {
    "RSA1_5",  # Vulnerable to padding oracle attacks
    "RSA_OAEP",  # Older, less secure than OAEP-256
}

# Recommended algorithms
RECOMMENDED_ALGORITHMS = {
    "RSA-OAEP-256",
    "ECDH-ES",
    "ECDH-ES+A128KW",
    "ECDH-ES+A256KW",
    "A256KW",
    "A256GCMKW",
}


class JWEWeakAlgorithmCheck:
    """Check for weak encryption algorithms in JWE tokens."""

    @property
    def name(self) -> str:
        return "jwe_weak_algorithm"

    @property
    def description(self) -> str:
        return "Detects weak or deprecated JWE encryption algorithms"

    @property
    def category(self) -> str:
        return "jwe"

    def run(self, token: DecodedJWE, **context) -> list[Finding]:
        _phase.check_start(self.name)

        findings = []
        alg = token.algorithm

        if alg and alg in WEAK_ALGORITHMS:
            findings.append(
                Finding(
                    check=self.name,
                    severity=Severity.HIGH,
                    message=f"JWE uses weak encryption algorithm: {alg}",
                    remediation=(
                        f"Replace {alg} with a stronger algorithm like RSA-OAEP-256 or ECDH-ES. "
                        "RSA1_5 is vulnerable to padding oracle attacks."
                    ),
                    source=CheckSource.STATIC,
                    details=f"Algorithm: {alg}",
                )
            )

        return findings


class JWEMissingEncryptionCheck:
    """Check for missing encryption method in JWE header."""

    @property
    def name(self) -> str:
        return "jwe_missing_encryption"

    @property
    def description(self) -> str:
        return "Detects JWE tokens missing the 'enc' header field"

    @property
    def category(self) -> str:
        return "jwe"

    def run(self, token: DecodedJWE, **context) -> list[Finding]:
        _phase.check_start(self.name)

        findings = []

        if not token.encryption_method:
            findings.append(
                Finding(
                    check=self.name,
                    severity=Severity.CRITICAL,
                    message="JWE header missing 'enc' (encryption method) field",
                    remediation=(
                        "JWE tokens must specify an encryption method (enc) in the header. "
                        "Common values: A256GCM, A128CBC-HS256."
                    ),
                    source=CheckSource.STATIC,
                )
            )

        return findings


class JWEWeakEncryptionMethodCheck:
    """Check for weak content encryption methods."""

    @property
    def name(self) -> str:
        return "jwe_weak_encryption_method"

    @property
    def description(self) -> str:
        return "Detects weak content encryption methods in JWE"

    @property
    def category(self) -> str:
        return "jwe"

    def run(self, token: DecodedJWE, **context) -> list[Finding]:
        _phase.check_start(self.name)

        findings = []
        enc = token.encryption_method

        # Weak encryption methods
        weak_methods = {
            "A128CBC-HS256",  # 128-bit is considered weak
            "A128KW",
        }

        if enc and enc in weak_methods:
            findings.append(
                Finding(
                    check=self.name,
                    severity=Severity.MEDIUM,
                    message=f"JWE uses weak content encryption method: {enc}",
                    remediation=(
                        f"Consider using stronger encryption like A256GCM or A256CBC-HS512. "
                        f"{enc} provides only 128-bit security."
                    ),
                    source=CheckSource.STATIC,
                    details=f"Encryption method: {enc}",
                )
            )

        return findings


class JWEAlgorithmNoneCheck:
    """Check for alg: none in JWE tokens."""

    @property
    def name(self) -> str:
        return "jwe_alg_none"

    @property
    def description(self) -> str:
        return "Detects JWE tokens using 'alg: none'"

    @property
    def category(self) -> str:
        return "jwe"

    def run(self, token: DecodedJWE, **context) -> list[Finding]:
        _phase.check_start(self.name)

        findings = []
        alg = token.algorithm

        if alg and alg.lower() == "none":
            findings.append(
                Finding(
                    check=self.name,
                    severity=Severity.CRITICAL,
                    message="JWE uses 'alg: none' — no key encryption",
                    remediation=(
                        "JWE tokens must use a key encryption algorithm. "
                        "'alg: none' means the encrypted key is not protected."
                    ),
                    source=CheckSource.STATIC,
                    details=f"Algorithm: {alg}",
                )
            )

        return findings


# Registry of JWE checks
JWE_CHECKS: list[Check] = [
    JWEAlgorithmNoneCheck(),
    JWEWeakAlgorithmCheck(),
    JWEMissingEncryptionCheck(),
    JWEWeakEncryptionMethodCheck(),
]
