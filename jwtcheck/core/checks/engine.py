"""
Check execution engine with proper error isolation.

Ensures each check runs independently - errors in one check
do not affect other checks (no error piggybacking).
"""

from __future__ import annotations

import time
from dataclasses import dataclass
from typing import Protocol, runtime_checkable

from jwtcheck.core.decoder import DecodedToken
from jwtcheck.core.findings import Finding
from jwtcheck.logging_config import ErrorLogger, PhaseLogger

_phase = PhaseLogger("check_engine")
_error = ErrorLogger("check_engine")


@runtime_checkable
class Check(Protocol):
    """Protocol for all security checks."""

    @property
    def name(self) -> str:
        """Unique identifier for this check."""
        ...

    @property
    def description(self) -> str:
        """Human-readable description."""
        ...

    @property
    def category(self) -> str:
        """Check category (algorithm, claims, privacy, etc.)."""
        ...

    def run(self, token: DecodedToken, **context) -> list[Finding]:
        """
        Execute the check against a decoded token.

        Args:
            token: The decoded JWT token.
            **context: Additional context (target, pubkey, etc.).

        Returns:
            List of findings (empty if no issues).
        """
        ...


@dataclass
class CheckResult:
    """Result of executing a single check."""

    check_name: str
    findings: list[Finding]
    success: bool
    error_message: str | None = None
    elapsed_ms: float = 0.0

    @property
    def finding_count(self) -> int:
        return len(self.findings)


class CheckExecutor:
    """
    Executes checks with proper error isolation.

    Each check runs in isolation - if one check fails, others continue.
    All errors are logged but don't propagate.
    """

    def __init__(self, checks: list[Check]):
        self.checks = checks
        self._results: list[CheckResult] = []

    def execute_all(self, token: DecodedToken, **context) -> list[CheckResult]:
        """
        Execute all registered checks.

        Args:
            token: The decoded JWT token.
            **context: Additional context for checks.

        Returns:
            List of CheckResult objects.
        """
        _phase.start("Executing checks", count=len(self.checks))
        self._results = []

        for check in self.checks:
            result = self._execute_single(check, token, **context)
            self._results.append(result)

        _phase.end(
            "Check execution complete",
            total_checks=len(self._results),
            failed=sum(1 for r in self._results if not r.success),
            total_findings=sum(r.finding_count for r in self._results),
        )

        return self._results

    def _execute_single(
        self, check: Check, token: DecodedToken, **context
    ) -> CheckResult:
        """
        Execute a single check with error isolation.

        Args:
            check: The check to execute.
            token: The decoded JWT token.
            **context: Additional context.

        Returns:
            CheckResult with findings or error information.
        """
        _phase.check_start(check.name)
        start_time = time.time()

        try:
            findings = check.run(token, **context)
            elapsed_ms = (time.time() - start_time) * 1000

            _phase.check_end(check.name, len(findings), elapsed_ms)

            return CheckResult(
                check_name=check.name,
                findings=findings,
                success=True,
                elapsed_ms=elapsed_ms,
            )

        except Exception as e:
            elapsed_ms = (time.time() - start_time) * 1000
            error_msg = f"{type(e).__name__}: {e}"

            _error.capture(
                e,
                context={"check": check.name, "elapsed_ms": elapsed_ms},
            )
            _phase.check_end(check.name, 0, elapsed_ms)

            return CheckResult(
                check_name=check.name,
                findings=[],
                success=False,
                error_message=error_msg,
                elapsed_ms=elapsed_ms,
            )

    @property
    def results(self) -> list[CheckResult]:
        """Get all execution results."""
        return self._results.copy()

    @property
    def all_findings(self) -> list[Finding]:
        """Get all findings from successful checks, sorted by severity."""
        findings = []
        for result in self._results:
            if result.success:
                findings.extend(result.findings)

        findings.sort(key=lambda f: f.severity.weight, reverse=True)
        return findings

    @property
    def failed_checks(self) -> list[CheckResult]:
        """Get results of failed checks."""
        return [r for r in self._results if not r.success]

    @property
    def successful_checks(self) -> list[CheckResult]:
        """Get results of successful checks."""
        return [r for r in self._results if r.success]


class CheckRegistry:
    """
    Registry for managing checks.

    Supports dynamic registration and retrieval of checks.
    """

    def __init__(self):
        self._checks: dict[str, Check] = {}

    def register(self, check: Check) -> None:
        """
        Register a check.

        Args:
            check: The check to register.

        Raises:
            ValueError: If a check with the same name already exists.
        """
        if check.name in self._checks:
            raise ValueError(f"Check '{check.name}' already registered")

        self._checks[check.name] = check

    def unregister(self, name: str) -> None:
        """
        Unregister a check by name.

        Args:
            name: The check name to unregister.
        """
        self._checks.pop(name, None)

    def get(self, name: str) -> Check | None:
        """
        Get a check by name.

        Args:
            name: The check name.

        Returns:
            The check, or None if not found.
        """
        return self._checks.get(name)

    def get_by_category(self, category: str) -> list[Check]:
        """
        Get all checks in a category.

        Args:
            category: The category name.

        Returns:
            List of checks in that category.
        """
        return [c for c in self._checks.values() if c.category == category]

    def all_checks(self) -> list[Check]:
        """Get all registered checks."""
        return list(self._checks.values())

    def __len__(self) -> int:
        return len(self._checks)

    def __iter__(self):
        return iter(self._checks.values())
