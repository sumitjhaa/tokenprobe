"""
Tests for findings data models.

Tests cover:
- Severity ordering and comparison
- Finding serialization
- Report aggregation and finalization
"""

import pytest

from tokenprobe.core.findings import (
    Finding,
    Report,
    Severity,
    Summary,
)


class TestSeverity:
    """Tests for Severity enum."""

    def test_ordering(self):
        assert Severity.CRITICAL > Severity.HIGH
        assert Severity.HIGH > Severity.MEDIUM
        assert Severity.MEDIUM > Severity.LOW
        assert Severity.LOW > Severity.INFO

    def test_weight_values(self):
        assert Severity.CRITICAL.weight == 5
        assert Severity.HIGH.weight == 4
        assert Severity.MEDIUM.weight == 3
        assert Severity.LOW.weight == 2
        assert Severity.INFO.weight == 1

    def test_equality(self):
        assert Severity.CRITICAL == Severity.CRITICAL
        assert Severity.CRITICAL != Severity.HIGH

    def test_sorting(self):
        severities = [Severity.LOW, Severity.CRITICAL, Severity.MEDIUM, Severity.HIGH, Severity.INFO]
        sorted_s = sorted(severities, reverse=True)
        assert sorted_s == [Severity.CRITICAL, Severity.HIGH, Severity.MEDIUM, Severity.LOW, Severity.INFO]


class TestFinding:
    """Tests for Finding dataclass."""

    def test_to_dict(self):
        f = Finding(
            check="test_check",
            severity=Severity.HIGH,
            message="Test message",
            remediation="Fix it",
        )
        d = f.to_dict()
        assert d["check"] == "test_check"
        assert d["severity"] == "high"
        assert d["message"] == "Test message"
        assert d["remediation"] == "Fix it"
        assert d["source"] == "static"

    def test_to_dict_with_details(self):
        f = Finding(
            check="test",
            severity=Severity.INFO,
            message="msg",
            remediation="fix",
            details="extra info",
        )
        d = f.to_dict()
        assert d["details"] == "extra info"

    def test_to_dict_without_details(self):
        f = Finding(
            check="test",
            severity=Severity.INFO,
            message="msg",
            remediation="fix",
        )
        d = f.to_dict()
        assert "details" not in d

    def test_frozen(self):
        f = Finding(
            check="test",
            severity=Severity.INFO,
            message="msg",
            remediation="fix",
        )
        with pytest.raises(AttributeError):
            f.check = "other"


class TestSummary:
    """Tests for Summary aggregation."""

    def test_add_counts(self):
        s = Summary()
        s.add(Severity.CRITICAL)
        s.add(Severity.CRITICAL)
        s.add(Severity.HIGH)
        s.add(Severity.MEDIUM)
        assert s.critical == 2
        assert s.high == 1
        assert s.medium == 1
        assert s.low == 0
        assert s.info == 0

    def test_total(self):
        s = Summary()
        s.add(Severity.CRITICAL)
        s.add(Severity.LOW)
        s.add(Severity.INFO)
        assert s.total == 3

    def test_has_critical_or_high(self):
        s = Summary()
        assert not s.has_critical_or_high
        s.add(Severity.MEDIUM)
        assert not s.has_critical_or_high
        s.add(Severity.HIGH)
        assert s.has_critical_or_high

    def test_to_dict(self):
        s = Summary()
        s.add(Severity.CRITICAL)
        s.add(Severity.HIGH)
        d = s.to_dict()
        assert d["critical"] == 1
        assert d["high"] == 1
        assert d["total"] == 2


class TestReport:
    """Tests for Report aggregation."""

    def test_empty_report(self):
        r = Report()
        r.finalize()
        assert r.exit_code == 0
        assert r.summary.total == 0
        assert r.token_valid_structure is True

    def test_add_finding_updates_summary(self):
        r = Report()
        r.add_finding(Finding("c1", Severity.CRITICAL, "msg", "fix"))
        r.add_finding(Finding("c2", Severity.HIGH, "msg", "fix"))
        assert r.summary.critical == 1
        assert r.summary.high == 1

    def test_finalize_sorts_by_severity(self):
        r = Report()
        r.add_finding(Finding("c1", Severity.LOW, "msg", "fix"))
        r.add_finding(Finding("c2", Severity.CRITICAL, "msg", "fix"))
        r.add_finding(Finding("c3", Severity.MEDIUM, "msg", "fix"))
        r.finalize()
        assert r.findings[0].severity == Severity.CRITICAL
        assert r.findings[1].severity == Severity.MEDIUM
        assert r.findings[2].severity == Severity.LOW

    def test_exit_code_1_on_critical(self):
        r = Report()
        r.add_finding(Finding("c1", Severity.CRITICAL, "msg", "fix"))
        r.finalize()
        assert r.exit_code == 1

    def test_exit_code_1_on_high(self):
        r = Report()
        r.add_finding(Finding("c1", Severity.HIGH, "msg", "fix"))
        r.finalize()
        assert r.exit_code == 1

    def test_exit_code_0_on_medium_and_below(self):
        r = Report()
        r.add_finding(Finding("c1", Severity.MEDIUM, "msg", "fix"))
        r.add_finding(Finding("c2", Severity.LOW, "msg", "fix"))
        r.add_finding(Finding("c3", Severity.INFO, "msg", "fix"))
        r.finalize()
        assert r.exit_code == 0

    def test_to_dict(self):
        r = Report()
        r.add_finding(Finding("c1", Severity.HIGH, "msg", "fix"))
        r.finalize()
        d = r.to_dict()
        assert d["token_valid_structure"] is True
        assert d["exit_code"] == 1
        assert len(d["findings"]) == 1
        assert d["summary"]["high"] == 1

    def test_invalid_structure_report(self):
        r = Report(token_valid_structure=False, error="bad token")
        r.finalize()
        d = r.to_dict()
        assert d["token_valid_structure"] is False
        assert d["error"] == "bad token"
