"""
Base protocol for security checks.

Defines the interface that all checks (static and active) must implement.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol

from tokenprobe.core.decoder import DecodedToken
from tokenprobe.core.findings import Finding


@dataclass
class CheckMetadata:
    """Metadata about a check for documentation and reporting."""
    name: str
    description: str
    category: str
    severity_hint: str


class Check(Protocol):
    """
    Protocol for security checks.

    All checks must implement a run() method that takes a DecodedToken
    and returns a list of Findings.
    """

    @property
    def metadata(self) -> CheckMetadata:
        """Return metadata about this check."""
        ...

    def run(self, token: DecodedToken) -> list[Finding]:
        """
        Run the check against a decoded token.

        Args:
            token: The decoded JWT token to analyze.

        Returns:
            List of findings (empty if no issues found).
        """
        ...
