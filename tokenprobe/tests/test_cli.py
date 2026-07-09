"""
Tests for CLI interface.

Tests cover:
- Token input from argument and stdin
- JSON and text output modes
- Error handling for invalid tokens
- Exit codes
"""

import json

import pytest
from click.testing import CliRunner

from tokenprobe.cli import main
from tokenprobe.tests.fixtures.tokens import (
    ALG_NONE_TOKEN,
    GOLD_STANDARD_TOKEN,
    MALFORMED_NO_DOTS,
    MULTI_ISSUE_TOKEN,
)


@pytest.fixture
def runner():
    return CliRunner()


class TestCLIBasic:
    """Basic CLI functionality tests."""

    def test_version(self, runner):
        result = runner.invoke(main, ["--version"])
        assert result.exit_code == 0
        assert "tokenprobe" in result.output

    def test_help(self, runner):
        result = runner.invoke(main, ["--help"])
        assert result.exit_code == 0
        assert "JWT Misconfiguration Checker" in result.output

    def test_no_token_shows_error(self, runner):
        result = runner.invoke(main, [], input="")
        assert result.exit_code == 2
        assert "Error" in result.output or "No token" in result.output


class TestCLITextOutput:
    """Tests for text (Rich) output mode."""

    def test_clean_token_text_output(self, runner):
        result = runner.invoke(main, [GOLD_STANDARD_TOKEN])
        assert result.exit_code == 0
        assert "All Clear" in result.output or "No security issues" in result.output

    def test_alg_none_text_output(self, runner):
        result = runner.invoke(main, [ALG_NONE_TOKEN])
        assert result.exit_code == 1
        assert "CRITICAL" in result.output or "alg_none" in result.output

    def test_multi_issue_text_output(self, runner):
        result = runner.invoke(main, [MULTI_ISSUE_TOKEN])
        assert result.exit_code == 1
        assert "Summary" in result.output


class TestCLIJsonOutput:
    """Tests for JSON output mode."""

    def _extract_json(self, output: str) -> dict:
        """Extract JSON from output that may contain logging."""
        import json as json_module
        lines = output.split('\n')
        json_start = None
        for i, line in enumerate(lines):
            if line.strip().startswith('{'):
                json_start = i
                break
        if json_start is None:
            raise ValueError("No JSON found in output")
        json_text = '\n'.join(lines[json_start:])
        return json_module.loads(json_text)

    def test_clean_token_json_output(self, runner):
        result = runner.invoke(main, ["--json", GOLD_STANDARD_TOKEN])
        assert result.exit_code == 0
        data = self._extract_json(result.output)
        assert data["token_valid_structure"] is True
        assert data["exit_code"] == 0

    def test_alg_none_json_output(self, runner):
        result = runner.invoke(main, ["--json", ALG_NONE_TOKEN])
        assert result.exit_code == 1
        data = self._extract_json(result.output)
        assert data["token_valid_structure"] is True
        assert data["exit_code"] == 1
        checks = [f["check"] for f in data["findings"]]
        assert "alg_none" in checks

    def test_malformed_token_json_output(self, runner):
        result = runner.invoke(main, ["--json", MALFORMED_NO_DOTS])
        assert result.exit_code == 0
        data = self._extract_json(result.output)
        assert data["token_valid_structure"] is False
        assert data["error"] is not None

    def test_json_has_summary(self, runner):
        result = runner.invoke(main, ["--json", MULTI_ISSUE_TOKEN])
        data = self._extract_json(result.output)
        assert "summary" in data
        assert "critical" in data["summary"]
        assert "high" in data["summary"]
        assert "total" in data["summary"]

    def test_json_findings_have_remediation(self, runner):
        result = runner.invoke(main, ["--json", ALG_NONE_TOKEN])
        data = self._extract_json(result.output)
        for finding in data["findings"]:
            assert "remediation" in finding
            assert len(finding["remediation"]) > 10


class TestCLIStdin:
    """Tests for reading token from stdin."""

    def test_stdin_input(self, runner):
        result = runner.invoke(main, [], input=GOLD_STANDARD_TOKEN)
        assert result.exit_code == 0

    def test_stdin_with_json(self, runner):
        result = runner.invoke(main, ["--json"], input=ALG_NONE_TOKEN)
        assert result.exit_code == 1
        data = json.loads(result.output)
        assert data["exit_code"] == 1


class TestCLIExitCodes:
    """Tests for exit code behavior."""

    def test_exit_0_clean_token(self, runner):
        result = runner.invoke(main, [GOLD_STANDARD_TOKEN])
        assert result.exit_code == 0

    def test_exit_1_critical_finding(self, runner):
        result = runner.invoke(main, [ALG_NONE_TOKEN])
        assert result.exit_code == 1

    def test_exit_1_high_finding(self, runner):
        from tokenprobe.tests.fixtures.tokens import MISSING_EXP_TOKEN
        result = runner.invoke(main, [MISSING_EXP_TOKEN])
        assert result.exit_code == 1

    def test_exit_0_medium_only(self, runner):
        from tokenprobe.tests.fixtures.tokens import MISSING_AUD_TOKEN
        result = runner.invoke(main, [MISSING_AUD_TOKEN])
        assert result.exit_code == 0


class TestCLILogging:
    """Tests for logging options."""

    def test_verbose_flag(self, runner):
        result = runner.invoke(main, ["--verbose", GOLD_STANDARD_TOKEN])
        assert result.exit_code == 0

    def test_no_log_file_flag(self, runner):
        result = runner.invoke(main, ["--no-log-file", GOLD_STANDARD_TOKEN])
        assert result.exit_code == 0
