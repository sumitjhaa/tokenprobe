"""
Tests for batch token analysis.

Tests cover:
- Loading tokens from files (text and JSON)
- Batch processing with multiple tokens
- Error handling for malformed tokens
- Batch result aggregation
- Severity summary calculation
"""

import json
import tempfile
from pathlib import Path

import pytest

from tokenprobe.core.batch import (
    BatchResult,
    load_tokens_from_file,
    process_batch,
    process_token,
    save_batch_result,
)
from tokenprobe.core.config import TokenProbeConfig
from tokenprobe.core.findings import Severity
from tokenprobe.tests.fixtures.tokens import (
    ALG_NONE_TOKEN,
    GOLD_STANDARD_TOKEN,
    MISSING_AUD_TOKEN,
    MISSING_EXP_TOKEN,
)


class TestBatchResult:
    """Tests for BatchResult class."""

    def test_empty_result(self):
        result = BatchResult()
        assert result.total_tokens == 0
        assert result.processed_tokens == 0
        assert result.success_rate == 0.0
        assert result.total_findings == 0
        assert result.severity_summary == {
            "critical": 0,
            "high": 0,
            "medium": 0,
            "low": 0,
            "info": 0,
        }

    def test_add_report(self):
        result = BatchResult()
        from tokenprobe.core.findings import Report
        report = Report()
        result.add_report(report, "test_token")
        assert result.total_tokens == 1
        assert result.processed_tokens == 1
        assert result.success_rate == 100.0

    def test_add_error(self):
        result = BatchResult()
        result.add_error("test_token", "decode error")
        assert result.total_tokens == 1
        assert result.processed_tokens == 0
        assert len(result.errors) == 1
        assert result.success_rate == 0.0

    def test_severity_summary(self):
        result = BatchResult()
        from tokenprobe.core.findings import Finding, Report
        report = Report()
        report.add_finding(Finding("test1", Severity.CRITICAL, "msg", "fix"))
        report.add_finding(Finding("test2", Severity.HIGH, "msg", "fix"))
        report.add_finding(Finding("test3", Severity.MEDIUM, "msg", "fix"))
        result.add_report(report, "token1")

        report2 = Report()
        report2.add_finding(Finding("test4", Severity.CRITICAL, "msg", "fix"))
        result.add_report(report2, "token2")

        summary = result.severity_summary
        assert summary["critical"] == 2
        assert summary["high"] == 1
        assert summary["medium"] == 1
        assert result.total_findings == 4

    def test_to_dict(self):
        result = BatchResult()
        from tokenprobe.core.findings import Report
        result.add_report(Report(), "token1")
        result.add_error("token2", "error")

        d = result.to_dict()
        assert d["total_tokens"] == 2
        assert d["processed_tokens"] == 1
        assert d["failed_tokens"] == 1
        assert "reports" in d
        assert "errors" in d


class TestLoadTokensFromFile:
    """Tests for load_tokens_from_file function."""

    def test_load_text_file(self):
        content = f"{ALG_NONE_TOKEN}\n{GOLD_STANDARD_TOKEN}\n{MISSING_EXP_TOKEN}\n"
        with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as f:
            f.write(content)
            f.flush()
            tokens = load_tokens_from_file(Path(f.name))

        assert len(tokens) == 3
        assert tokens[0] == ALG_NONE_TOKEN
        Path(f.name).unlink()

    def test_load_text_file_with_comments(self):
        content = f"# Comment\n{ALG_NONE_TOKEN}\n# Another comment\n{GOLD_STANDARD_TOKEN}\n"
        with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as f:
            f.write(content)
            f.flush()
            tokens = load_tokens_from_file(Path(f.name))

        assert len(tokens) == 2
        Path(f.name).unlink()

    def test_load_json_array(self):
        tokens_list = [ALG_NONE_TOKEN, GOLD_STANDARD_TOKEN]
        with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as f:
            json.dump(tokens_list, f)
            f.flush()
            tokens = load_tokens_from_file(Path(f.name))

        assert len(tokens) == 2
        Path(f.name).unlink()

    def test_load_json_object(self):
        data = {"tokens": [ALG_NONE_TOKEN, GOLD_STANDARD_TOKEN]}
        with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as f:
            json.dump(data, f)
            f.flush()
            tokens = load_tokens_from_file(Path(f.name))

        assert len(tokens) == 2
        Path(f.name).unlink()

    def test_load_nonexistent_file(self):
        with pytest.raises(FileNotFoundError):
            load_tokens_from_file(Path("/nonexistent/tokens.txt"))

    def test_load_empty_file(self):
        with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as f:
            f.write("")
            f.flush()
            tokens = load_tokens_from_file(Path(f.name))

        assert len(tokens) == 0
        Path(f.name).unlink()


class TestProcessToken:
    """Tests for process_token function."""

    def test_process_valid_token(self):
        report = process_token(GOLD_STANDARD_TOKEN)
        assert report.token_valid_structure is True
        assert report.error is None

    def test_process_invalid_token(self):
        report = process_token("invalid.token")
        assert report.token_valid_structure is False
        assert report.error is not None

    def test_process_with_config(self):
        config = TokenProbeConfig(required_claims=["sub", "exp", "custom_claim"])
        report = process_token(GOLD_STANDARD_TOKEN, config=config)
        assert report.token_valid_structure is True
        # Should have finding for missing custom_claim
        custom_findings = [f for f in report.findings if f.check == "custom_required_claims"]
        assert len(custom_findings) > 0


class TestProcessBatch:
    """Tests for process_batch function."""

    def test_process_batch_mixed(self):
        tokens = [ALG_NONE_TOKEN, GOLD_STANDARD_TOKEN, "invalid.token"]
        result = process_batch(tokens)

        assert result.total_tokens == 3
        assert result.processed_tokens == 2
        assert len(result.errors) == 1
        assert result.success_rate == pytest.approx(66.67, rel=0.01)

    def test_process_batch_all_valid(self):
        tokens = [ALG_NONE_TOKEN, GOLD_STANDARD_TOKEN, MISSING_EXP_TOKEN]
        result = process_batch(tokens)

        assert result.total_tokens == 3
        assert result.processed_tokens == 3
        assert len(result.errors) == 0
        assert result.success_rate == 100.0

    def test_process_batch_with_config(self):
        tokens = [GOLD_STANDARD_TOKEN, MISSING_AUD_TOKEN]
        config = TokenProbeConfig(required_claims=["sub", "exp", "aud", "iss"])
        result = process_batch(tokens, config=config)

        assert result.total_tokens == 2
        assert result.processed_tokens == 2

    def test_process_batch_empty_list(self):
        result = process_batch([])
        assert result.total_tokens == 0
        assert result.processed_tokens == 0


class TestSaveBatchResult:
    """Tests for save_batch_result function."""

    def test_save_to_file(self):
        result = BatchResult()
        from tokenprobe.core.findings import Report
        result.add_report(Report(), "token1")

        with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as f:
            output_path = Path(f.name)

        save_batch_result(result, output_path)

        # Verify file was created and contains valid JSON
        assert output_path.exists()
        with open(output_path) as f:
            data = json.load(f)
        assert data["total_tokens"] == 1

        output_path.unlink()

    def test_save_with_errors(self):
        result = BatchResult()
        result.add_error("bad_token", "decode error")

        with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as f:
            output_path = Path(f.name)

        save_batch_result(result, output_path)

        with open(output_path) as f:
            data = json.load(f)
        assert len(data["errors"]) == 1
        assert data["errors"][0]["token"] == "bad_token"

        output_path.unlink()
