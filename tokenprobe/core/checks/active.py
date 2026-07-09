"""
Active security checks for JWT misconfiguration detection.

These checks require network access and probe a live endpoint.
Must be explicitly enabled with safety gates.
"""

from __future__ import annotations

import base64
import hashlib
import hmac
import json

import requests

from tokenprobe.core.checks.engine import Check
from tokenprobe.core.decoder import DecodedToken
from tokenprobe.core.findings import CheckSource, Finding, Severity
from tokenprobe.core.wordlist import get_wordlist
from tokenprobe.logging_config import ErrorLogger, PhaseLogger

_phase = PhaseLogger("active_checks")
_error = ErrorLogger("active_checks")


def _base64url_encode(data: bytes) -> str:
    """Base64url-encode bytes without padding."""
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def _create_hs256_signature(header_b64: str, payload_b64: str, secret: str) -> str:
    """Create an HS256 signature."""
    signing_input = f"{header_b64}.{payload_b64}".encode()
    signature = hmac.new(secret.encode(), signing_input, hashlib.sha256).digest()
    return _base64url_encode(signature)


class WeakSecretBruteforceCheck:
    """Check if JWT is signed with a weak secret."""

    @property
    def name(self) -> str:
        return "weak_secret_bruteforce"

    @property
    def description(self) -> str:
        return "Brute-forces HS256 secret against common wordlist"

    @property
    def category(self) -> str:
        return "active"

    def run(self, token: DecodedToken, **context) -> list[Finding]:
        alg = token.algorithm
        if not alg or alg.upper() != "HS256":
            return []

        wordlist = get_wordlist()
        _phase.info("Testing wordlist", size=len(wordlist))

        for secret in wordlist:
            expected_sig = _create_hs256_signature(
                token.header_b64, token.payload_b64, secret
            )

            if expected_sig == token.signature_b64:
                return [
                    Finding(
                        check=self.name,
                        severity=Severity.CRITICAL,
                        message="JWT signed with weak secret from common wordlist",
                        remediation=(
                            "Use a strong, randomly generated secret (min 256 bits). "
                            "Example: openssl rand -base64 32"
                        ),
                        source=CheckSource.ACTIVE,
                        details=f"Secret: '{secret}' (length: {len(secret)})",
                    )
                ]

        return []


class AlgConfusionProbeCheck:
    """Probe for algorithm confusion vulnerability."""

    @property
    def name(self) -> str:
        return "alg_confusion_probe"

    @property
    def description(self) -> str:
        return "Probes endpoint for algorithm confusion vulnerability"

    @property
    def category(self) -> str:
        return "active"

    def run(self, token: DecodedToken, **context) -> list[Finding]:
        target = context.get("target")
        if not target:
            return []

        pubkey_pem = context.get("pubkey_pem")
        if not pubkey_pem:
            try:
                pubkey_pem = self._fetch_public_key(target)
            except Exception as e:
                _error.capture(e, context={"target": target})
                return []

        if not pubkey_pem:
            return []

        try:
            confused_token = self._create_confused_token(token, pubkey_pem)
            if self._probe_endpoint(target, confused_token):
                return [
                    Finding(
                        check=self.name,
                        severity=Severity.CRITICAL,
                        message="Endpoint accepted algorithm-confused token (RS256→HS256)",
                        remediation=(
                            "Enforce strict algorithm validation. "
                            "Explicitly specify allowed algorithms."
                        ),
                        source=CheckSource.ACTIVE,
                        details=f"Target: {target}",
                    )
                ]
        except Exception as e:
            _error.capture(e, context={"target": target})

        return []

    def _fetch_public_key(self, target: str) -> str | None:
        """Fetch public key from JWKS endpoint."""
        try:
            import jwt
            from cryptography.hazmat.primitives import serialization

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
        """Create token with algorithm confusion."""
        confused_header = token.header.copy()
        confused_header["alg"] = "HS256"

        header_b64 = _base64url_encode(json.dumps(confused_header).encode())
        payload_b64 = token.payload_b64

        signature = _create_hs256_signature(header_b64, payload_b64, pubkey_pem)

        return f"{header_b64}.{payload_b64}.{signature}"

    def _probe_endpoint(self, target: str, token: str) -> bool:
        """Send confused token to target."""
        try:
            headers = {"Authorization": f"Bearer {token}"}
            response = requests.get(target, headers=headers, timeout=5)
            return 200 <= response.status_code < 300
        except Exception as e:
            _error.capture(e, context={"step": "probe_endpoint", "target": target})
            return False


ACTIVE_CHECKS: list[Check] = [
    WeakSecretBruteforceCheck(),
    AlgConfusionProbeCheck(),
]
