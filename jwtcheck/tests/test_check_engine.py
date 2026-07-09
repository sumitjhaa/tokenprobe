"""
Comprehensive tests for the check execution engine.

Tests error isolation, check registry, and execution flow.
"""

import time

import pytest

from jwtcheck.core.checks.engine import (
    CheckExecutor,
    CheckRegistry,
    CheckResult,
)
from jwtcheck.core.decoder import decode_token
from jwtcheck.core.findings import Finding, Severity
from jwtcheck.tests.fixtures.tokens import ALG_NONE_TOKEN, GOLD_STANDARD_TOKEN


class MockCheck:
    """Mock check for testing."""

    def __init__(self, name: str, findings: list[Finding] | None = None, should_fail: bool = False):
        self._name = name
        self._findings = findings or []
        self._should_fail = should_fail

    @property
    def name(self) -> str:
        return self._name

    @property
    def description(self) -> str:
        return f"Mock check: {self._name}"

    @property
    def category(self) -> str:
        return "test"

    def run(self, token, **context) -> list[Finding]:
        if self._should_fail:
            raise RuntimeError(f"Mock failure in {self._name}")
        return self._findings


class TestCheckResult:
    """Tests for CheckResult dataclass."""

    def test_successful_result(self):
        findings = [
            Finding("test", Severity.HIGH, "msg", "fix"),
        ]
        result = CheckResult(
            check_name="test_check",
            findings=findings,
            success=True,
            elapsed_ms=10.5,
        )

        assert result.check_name == "test_check"
        assert result.success is True
        assert result.finding_count == 1
        assert result.elapsed_ms == 10.5
        assert result.error_message is None

    def test_failed_result(self):
        result = CheckResult(
            check_name="failed_check",
            findings=[],
            success=False,
            error_message="RuntimeError: something broke",
            elapsed_ms=5.0,
        )

        assert result.success is False
        assert result.finding_count == 0
        assert "something broke" in result.error_message


class TestCheckExecutor:
    """Tests for CheckExecutor with error isolation."""

    def test_execute_all_checks(self):
        token = decode_token(GOLD_STANDARD_TOKEN)
        check1 = MockCheck("check1", [])
        check2 = MockCheck("check2", [Finding("test", Severity.LOW, "msg", "fix")])

        executor = CheckExecutor([check1, check2])
        results = executor.execute_all(token)

        assert len(results) == 2
        assert all(r.success for r in results)
        assert executor.all_findings[0].check == "test"

    def test_error_isolation(self):
        """Failed check should not affect other checks."""
        token = decode_token(GOLD_STANDARD_TOKEN)

        failing_check = MockCheck("failing", should_fail=True)
        good_check = MockCheck("good", [Finding("test", Severity.HIGH, "msg", "fix")])

        executor = CheckExecutor([failing_check, good_check])
        results = executor.execute_all(token)

        assert len(results) == 2
        assert results[0].success is False
        assert results[1].success is True
        assert len(executor.all_findings) == 1
        assert len(executor.failed_checks) == 1
        assert len(executor.successful_checks) == 1

    def test_multiple_failures_isolated(self):
        """Multiple failing checks should all be isolated."""
        token = decode_token(GOLD_STANDARD_TOKEN)

        checks = [
            MockCheck("fail1", should_fail=True),
            MockCheck("fail2", should_fail=True),
            MockCheck("good", []),
        ]

        executor = CheckExecutor(checks)
        results = executor.execute_all(token)

        assert len(results) == 3
        assert sum(1 for r in results if not r.success) == 2
        assert len(executor.failed_checks) == 2
        assert len(executor.successful_checks) == 1

    def test_findings_sorted_by_severity(self):
        """All findings should be sorted by severity."""
        token = decode_token(ALG_NONE_TOKEN)

        check1 = MockCheck("check1", [Finding("low", Severity.LOW, "msg", "fix")])
        check2 = MockCheck("check2", [Finding("critical", Severity.CRITICAL, "msg", "fix")])
        check3 = MockCheck("check3", [Finding("medium", Severity.MEDIUM, "msg", "fix")])

        executor = CheckExecutor([check1, check2, check3])
        executor.execute_all(token)

        findings = executor.all_findings
        assert len(findings) == 3
        assert findings[0].severity == Severity.CRITICAL
        assert findings[1].severity == Severity.MEDIUM
        assert findings[2].severity == Severity.LOW

    def test_elapsed_time_tracked(self):
        """Execution time should be tracked."""
        token = decode_token(GOLD_STANDARD_TOKEN)

        class SlowCheck:
            @property
            def name(self) -> str:
                return "slow"

            @property
            def description(self) -> str:
                return "Slow check"

            @property
            def category(self) -> str:
                return "test"

            def run(self, token, **context):
                time.sleep(0.01)
                return []

        executor = CheckExecutor([SlowCheck()])
        results = executor.execute_all(token)

        assert results[0].elapsed_ms >= 10.0

    def test_context_passed_to_checks(self):
        """Context should be passed to checks."""
        token = decode_token(GOLD_STANDARD_TOKEN)
        received_context = {}

        class ContextCheck:
            @property
            def name(self) -> str:
                return "context_check"

            @property
            def description(self) -> str:
                return "Context check"

            @property
            def category(self) -> str:
                return "test"

            def run(self, token, **context):
                received_context.update(context)
                return []

        executor = CheckExecutor([ContextCheck()])
        executor.execute_all(token, target="https://example.com", custom="value")

        assert received_context["target"] == "https://example.com"
        assert received_context["custom"] == "value"


class TestCheckRegistry:
    """Tests for CheckRegistry."""

    def test_register_check(self):
        registry = CheckRegistry()
        check = MockCheck("test_check")

        registry.register(check)

        assert len(registry) == 1
        assert registry.get("test_check") is check

    def test_register_duplicate_raises(self):
        registry = CheckRegistry()
        check1 = MockCheck("duplicate")
        check2 = MockCheck("duplicate")

        registry.register(check1)

        with pytest.raises(ValueError, match="already registered"):
            registry.register(check2)

    def test_unregister_check(self):
        registry = CheckRegistry()
        check = MockCheck("to_remove")

        registry.register(check)
        assert len(registry) == 1

        registry.unregister("to_remove")
        assert len(registry) == 0
        assert registry.get("to_remove") is None

    def test_get_by_category(self):
        registry = CheckRegistry()

        class AlgCheck:
            @property
            def name(self) -> str:
                return "alg_check"

            @property
            def description(self) -> str:
                return "Alg check"

            @property
            def category(self) -> str:
                return "algorithm"

            def run(self, token, **context):
                return []

        class ClaimsCheck:
            @property
            def name(self) -> str:
                return "claims_check"

            @property
            def description(self) -> str:
                return "Claims check"

            @property
            def category(self) -> str:
                return "claims"

            def run(self, token, **context):
                return []

        registry.register(AlgCheck())
        registry.register(ClaimsCheck())

        alg_checks = registry.get_by_category("algorithm")
        assert len(alg_checks) == 1
        assert alg_checks[0].name == "alg_check"

    def test_all_checks(self):
        registry = CheckRegistry()
        check1 = MockCheck("check1")
        check2 = MockCheck("check2")

        registry.register(check1)
        registry.register(check2)

        all_checks = registry.all_checks()
        assert len(all_checks) == 2

    def test_iteration(self):
        registry = CheckRegistry()
        check1 = MockCheck("check1")
        check2 = MockCheck("check2")

        registry.register(check1)
        registry.register(check2)

        names = [c.name for c in registry]
        assert "check1" in names
        assert "check2" in names

    def test_get_nonexistent_returns_none(self):
        registry = CheckRegistry()
        assert registry.get("nonexistent") is None


class TestIntegration:
    """Integration tests for engine with real checks."""

    def test_static_checks_integration(self):
        """Test with actual static checks."""
        from jwtcheck.core.checks.static import STATIC_CHECKS

        token = decode_token(ALG_NONE_TOKEN)
        executor = CheckExecutor(STATIC_CHECKS)
        results = executor.execute_all(token)

        assert len(results) == len(STATIC_CHECKS)
        assert all(r.success for r in results)
        assert len(executor.all_findings) > 0

        alg_none_findings = [f for f in executor.all_findings if f.check == "alg_none"]
        assert len(alg_none_findings) == 1
        assert alg_none_findings[0].severity == Severity.CRITICAL

    def test_gold_standard_no_critical(self):
        """Gold standard should have no critical/high findings."""
        from jwtcheck.core.checks.static import STATIC_CHECKS

        token = decode_token(GOLD_STANDARD_TOKEN)
        executor = CheckExecutor(STATIC_CHECKS)
        executor.execute_all(token)

        critical_high = [
            f for f in executor.all_findings
            if f.severity in (Severity.CRITICAL, Severity.HIGH)
        ]
        assert len(critical_high) == 0
