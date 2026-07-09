"""
Data models for security findings and severity levels.

Provides the core data structures used throughout jwtcheck to represent
security findings, their severity, and aggregated reports.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Optional


class Severity(Enum):
    """
    Severity levels for security findings.

    Ordered from most to least severe for comparison and sorting.
    """
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"

    @property
    def weight(self) -> int:
        """Numeric weight for sorting (higher = more severe)."""
        weights = {
            Severity.CRITICAL: 5,
            Severity.HIGH: 4,
            Severity.MEDIUM: 3,
            Severity.LOW: 2,
            Severity.INFO: 1,
        }
        return weights[self]

    def __lt__(self, other: Severity) -> bool:
        return self.weight < other.weight

    def __le__(self, other: Severity) -> bool:
        return self.weight <= other.weight

    def __gt__(self, other: Severity) -> bool:
        return self.weight > other.weight

    def __ge__(self, other: Severity) -> bool:
        return self.weight >= other.weight


class CheckSource(Enum):
    """Source of a check — static analysis or active probing."""
    STATIC = "static"
    ACTIVE = "active"


@dataclass(frozen=True)
class Finding:
    """
    A single security finding from a JWT check.

    Attributes:
        check: Name of the check that produced this finding.
        severity: Severity level of the finding.
        message: Human-readable description of the issue.
        remediation: Suggested fix or mitigation.
        source: Whether this came from static or active analysis.
        details: Optional additional technical details.
    """
    check: str
    severity: Severity
    message: str
    remediation: str
    source: CheckSource = CheckSource.STATIC
    details: Optional[str] = None

    def to_dict(self) -> dict:
        """Convert finding to a dictionary for JSON serialization."""
        result = {
            "check": self.check,
            "severity": self.severity.value,
            "message": self.message,
            "remediation": self.remediation,
            "source": self.source.value,
        }
        if self.details:
            result["details"] = self.details
        return result


@dataclass
class Summary:
    """Aggregated count of findings by severity."""
    critical: int = 0
    high: int = 0
    medium: int = 0
    low: int = 0
    info: int = 0

    def add(self, severity: Severity) -> None:
        """Increment the count for a given severity level."""
        if severity == Severity.CRITICAL:
            self.critical += 1
        elif severity == Severity.HIGH:
            self.high += 1
        elif severity == Severity.MEDIUM:
            self.medium += 1
        elif severity == Severity.LOW:
            self.low += 1
        elif severity == Severity.INFO:
            self.info += 1

    @property
    def total(self) -> int:
        return self.critical + self.high + self.medium + self.low + self.info

    @property
    def has_critical_or_high(self) -> bool:
        return self.critical > 0 or self.high > 0

    def to_dict(self) -> dict:
        return {
            "critical": self.critical,
            "high": self.high,
            "medium": self.medium,
            "low": self.low,
            "info": self.info,
            "total": self.total,
        }


@dataclass
class Report:
    """
    Complete analysis report for a JWT token.

    Attributes:
        token_valid_structure: Whether the token could be decoded.
        findings: List of all findings, sorted by severity.
        summary: Aggregated counts by severity.
        exit_code: 0 if clean, 1 if critical/high findings present.
        error: Error message if token could not be decoded.
    """
    token_valid_structure: bool = True
    findings: list[Finding] = field(default_factory=list)
    summary: Summary = field(default_factory=Summary)
    exit_code: int = 0
    error: Optional[str] = None

    def add_finding(self, finding: Finding) -> None:
        """Add a finding and update the summary."""
        self.findings.append(finding)
        self.summary.add(finding.severity)

    def finalize(self) -> None:
        """Sort findings by severity and compute exit code."""
        self.findings.sort(key=lambda f: f.severity.weight, reverse=True)
        self.exit_code = 1 if self.summary.has_critical_or_high else 0

    def to_dict(self) -> dict:
        """Convert report to a dictionary for JSON serialization."""
        return {
            "token_valid_structure": self.token_valid_structure,
            "findings": [f.to_dict() for f in self.findings],
            "summary": self.summary.to_dict(),
            "exit_code": self.exit_code,
            "error": self.error,
        }
