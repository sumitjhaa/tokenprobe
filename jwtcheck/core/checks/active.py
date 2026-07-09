"""
Active security checks for JWT misconfiguration detection (P1).

These checks require network access and probe a live endpoint.
They must be explicitly enabled with --active --target --i-own-this-system flags.

WARNING: These checks send requests to the target endpoint. Only use on
systems you own or have explicit permission to test.
"""

from __future__ import annotations

import base64
import hashlib
import hmac
import json
import time
from typing import Optional

import requests

from jwtcheck.core.checks.base import CheckMetadata
from jwtcheck.core.decoder import DecodedToken
from jwtcheck.core.findings import CheckSource, Finding, Severity
from jwtcheck.core.wordlist import get_wordlist
from jwtcheck.logging_config import ErrorLogger, PhaseLogger

_phase = PhaseLogger("active_checks")
_error = ErrorLogger("active_checks")


def _base64url_encode(data: bytes) -> str:
    """Base64url-encode bytes without padding."""
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def _create_hs256_signature(header_b64: str, payload_b64: str, secret: str) -> str:
    """
    Create an HS256 signature for the given header and payload.

    Args:
        header_b64: Base64url-encoded header.
        payload_b64: Base64url-encoded payload.
        secret: The HMAC secret.

    Returns:
        Base64url-encoded signature.
    """
    signing_input = f"{header_b64}.{payload_b64}".encode()
    signature = hmac.new(secret.encode(), signing_input, hashlib.sha256).digest()
    return _base64url_encode(signature)


class WeakSecretBruteforceCheck:
    """
    Check if the JWT is signed with a weak secret from the common wordlist.

    This check re-signs the token's header+payload with each wordlist entry
    and compares the signature to the token's actual signature.
    """

    @property
    def metadata(self) -> CheckMetadata:
        return CheckMetadata(
            name="weak_secret_bruteforce",
            description="Brute-forces HS256 secret against common wordlist",
            category="active",
            severity_hint="critical",
        )

    def run(self, token: DecodedToken, **kwargs) -> list[Finding]:
        """
        Run the weak secret brute force check.

        Args:
            token: The decoded JWT token.
            **kwargs: Ignored (for compatibility).

        Returns:
            List of findings (Critical if weak secret found).
        """
        _phase.check_start("weak_secret_bruteforce")
        start_time = time.time()

        findings = []
        alg = token.algorithm

        if not alg or alg.upper() != "HS256":
            _phase.check_end("weak_secret_bruteforce", 0, 0)
            return findings

        wordlist = get_wordlist()
        _phase.info("Testing wordlist", size=len(wordlist))

        for secret in wordlist:
            expected_sig = _create_hs256_signature(
                token.header_b64, token.payload_b64, secret
            )

            if expected_sig == token.signature_b64:
                findings.append(
                    Finding(
                        check="weak_secret_bruteforce",
                        severity=Severity.CRITICAL,
                        message=f"JWT signed with weak secret found in common wordlist",
                        remediation=(
                            "Use a strong, randomly generated secret (minimum 256 bits / 32 bytes). "
                            "Example: openssl rand -base64 32"
                        ),
                        source=CheckSource.ACTIVE,
                        details=f"Secret matched: '{secret}' (length: {len(secret)})",
                    )
                )
                _phase.info("Weak secret found", secret=secret)
                break

        elapsed_ms = (time.time() - start_time) * 1000
        _phase.check_end("weak_secret_bruteforce", len(findings), elapsed_ms)
        return findings


class AlgConfusionProbeCheck:
    """
    Probe for algorithm confusion vulnerability by re-signing token as HS256
    using the server's RSA public key.

    This check requires:
    - target: The endpoint URL to probe
    - pubkey_pem: The server's RSA public key in PEM format (optional, can fetch from JWKS)

    WARNING: This sends a request to the target endpoint.
    """

    @property
    def metadata(self) -> CheckMetadata:
        return CheckMetadata(
            name="alg_confusion_probe",
            description="Probes endpoint for algorithm confusion vulnerability",
            category="active",
            severity_hint="critical",
        )

    def run(
        self,
        token: DecodedToken,
        target: Optional[str] = None,
        pubkey_pem: Optional[str] = None,
        **kwargs,
    ) -> list[Finding]:
        """
        Run the algorithm confusion probe.

        Args:
            token: The decoded JWT token.
            target: The endpoint URL to probe.
            pubkey_pem: The server's RSA public key in PEM format.
            **kwargs: Additional arguments (ignored).

        Returns:
            List of findings (Critical if endpoint accepts confused token).
        """
        _phase.check_start("alg_confusion_probe")
        start_time = time.time()

        findings = []

        if not target:
            _error.warning("No target provided for alg_confusion_probe")
            _phase.check_end("alg_confusion_probe", 0, 0)
            return findings

        if not pubkey_pem:
            _phase.info("No public key provided, attempting to fetch from JWKS")
            try:
                pubkey_pem = self._fetch_public_key(target)
            except Exception as e:
                _error.capture(e, context={"target": target})
                _phase.check_end("alg_confusion_probe", 0, 0)
                return findings

        if not pubkey_pem:
            _phase.info("Could not obtain public key")
            _phase.check_end("alg_confusion_probe", 0, 0)
            return findings

        try:
            confused_token = self._create_confused_token(token, pubkey_pem)
            accepted = self._probe_endpoint(target, confused_token)

            if accepted:
                findings.append(
                    Finding(
                        check="alg_confusion_probe",
                        severity=Severity.CRITICAL,
                        message="Endpoint accepted algorithm-confused token (RS256→HS256)",
                        remediation=(
                            "Enforce strict algorithm validation on the server. "
                            "Explicitly specify allowed algorithms (e.g., algorithms=['RS256']) "
                            "and reject tokens with unexpected algorithms."
                        ),
                        source=CheckSource.ACTIVE,
                        details=f"Target: {target}",
                    )
                )
                _phase.info("Algorithm confusion vulnerability confirmed")

        except Exception as e:
            _error.capture(e, context={"target": target})

        elapsed_ms = (time.time() - start_time) * 1000
        _phase.check_end("alg_confusion_probe", len(findings), elapsed_ms)
        return findings

    def _fetch_public_key(self, target: str) -> Optional[str]:
        """
        Attempt to fetch the server's public key from JWKS endpoint.

        Args:
            target: The target endpoint URL.

        Returns:
            Public key in PEM format, or None if not found.
        """
        try:
            from cryptography.hazmat.primitives import serialization
            from cryptography.hazmat.primitives.asymmetric import rsa
            import jwt

            jwks_url = target.rstrip("/") + "/.well-known/jwks.json"
            response = requests.get(jwks_url, timeout=5)

            if response.status_code != 200:
                return None

            jwks = response.json()
            if not jwks.get("keys"):
                return None

            first_key = jwks["keys"][0]
            public_key = jwt.algorithms.RSAAlgorithm.from_jwk(json.dumps(first_key))

            pem = public_key.public_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PublicFormat.SubjectPublicKeyInfo,
            )
            return pem.decode()

        except Exception as e:
            _error.capture(e, context={"step": "fetch_public_key"})
            return None

    def _create_confused_token(self, token: DecodedToken, pubkey_pem: str) -> str:
        """
        Create a token with algorithm confusion (RS256→HS256).

        Changes the algorithm to HS256 and signs with the RSA public key as the secret.

        Args:
            token: The original decoded token.
            pubkey_pem: The RSA public key in PEM format.

        Returns:
            The confused token string.
        """
        confused_header = token.header.copy()
        confused_header["alg"] = "HS256"

        header_b64 = _base64url_encode(json.dumps(confused_header).encode())
        payload_b64 = token.payload_b64

        signature = _create_hs256_signature(header_b64, payload_b64, pubkey_pem)

        return f"{header_b64}.{payload_b64}.{signature}"

    def _probe_endpoint(self, target: str, token: str) -> bool:
        """
        Send the confused token to the target endpoint.

        Args:
            target: The endpoint URL.
            token: The confused JWT token.

        Returns:
            True if the endpoint accepts the token (2xx response).
        """
        try:
            headers = {"Authorization": f"Bearer {token}"}
            response = requests.get(target, headers=headers, timeout=5)

            return 200 <= response.status_code < 300

        except Exception as e:
            _error.capture(e, context={"step": "probe_endpoint", "target": target})
            return False


ACTIVE_CHECK_REGISTRY: list = [
    WeakSecretBruteforceCheck(),
    AlgConfusionProbeCheck(),
]


def run_all_active_checks(
    token: DecodedToken,
    target: Optional[str] = None,
    pubkey_pem: Optional[str] = None,
) -> list[Finding]:
    """
    Run all registered active checks against a decoded token.

    Args:
        token: The decoded JWT token to analyze.
        target: The target endpoint URL (required for some checks).
        pubkey_pem: The server's public key in PEM format (optional).

    Returns:
        Combined list of all findings from all checks.
    """
    _phase.start(
        "Running all active checks",
        checks_count=len(ACTIVE_CHECK_REGISTRY),
        target=target,
    )

    all_findings = []
    for check in ACTIVE_CHECK_REGISTRY:
        try:
            findings = check.run(token, target=target, pubkey_pem=pubkey_pem)
            all_findings.extend(findings)
        except Exception as e:
            _error.capture(e, context={"check": check.metadata.name})

    _phase.end("Active checks complete", success=True, total_findings=len(all_findings))
    all_findings.sort(key=lambda f: f.severity.weight, reverse=True)
    return all_findings
