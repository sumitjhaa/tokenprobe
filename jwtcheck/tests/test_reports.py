"""
Tests for report rendering modules.

Tests cover:
- JSON report serialization
- Text report rendering (smoke tests)
"""

import json
from io import StringIO

from rich.console import Console

from jwtcheck.core.findings import Finding, Report, Severity
from jwtcheck.report.json_report import render_json_report, render_json_to_string
from jwtcheck.report.text_report import render_text_report


class TestJsonReport:
    """Tests for JSON report generation."""

    def test_render_to_string(self):
        report = Report()
        report.add_finding(Finding("test", Severity.HIGH, "msg", "fix"))
        report.finalize()

        output = render_json_to_string(report)
        data = json.loads(output)
        assert data["exit_code"] == 1
        assert len(data["findings"]) == 1

    def test_render_to_file(self):
        report = Report()
        report.finalize()

        buf = StringIO()
        render_json_report(report, file=buf)
        buf.seek(0)
        data = json.loads(buf.read())
        assert data["exit_code"] == 0

    def test_json_structure(self):
        report = Report()
        report.add_finding(Finding("c1", Severity.CRITICAL, "msg", "fix"))
        report.add_finding(Finding("c2", Severity.MEDIUM, "msg", "fix"))
        report.finalize()

        output = render_json_to_string(report)
        data = json.loads(output)

        assert "token_valid_structure" in data
        assert "findings" in data
        assert "summary" in data
        assert "exit_code" in data
        assert data["summary"]["critical"] == 1
        assert data["summary"]["medium"] == 1
        assert data["summary"]["total"] == 2


class TestTextReport:
    """Smoke tests for text report rendering."""

    def test_clean_report_renders(self):
        report = Report()
        report.finalize()
        console = Console(file=StringIO(), force_terminal=True)
        render_text_report(report, console)
        output = console.file.getvalue()
        assert "All Clear" in output or "No security issues" in output

    def test_findings_report_renders(self):
        report = Report()
        report.add_finding(Finding("test", Severity.HIGH, "msg", "fix"))
        report.finalize()
        console = Console(file=StringIO(), force_terminal=True)
        render_text_report(report, console)
        output = console.file.getvalue()
        assert "HIGH" in output or "test" in output

    def test_error_report_renders(self):
        report = Report(token_valid_structure=False, error="bad token")
        report.finalize()
        console = Console(file=StringIO(), force_terminal=True)
        render_text_report(report, console)
        output = console.file.getvalue()
        assert "Error" in output or "bad token" in output

    def test_summary_present(self):
        report = Report()
        report.add_finding(Finding("c1", Severity.CRITICAL, "msg", "fix"))
        report.add_finding(Finding("c2", Severity.LOW, "msg", "fix"))
        report.finalize()
        console = Console(file=StringIO(), force_terminal=True)
        render_text_report(report, console)
        output = console.file.getvalue()
        assert "Summary" in output
