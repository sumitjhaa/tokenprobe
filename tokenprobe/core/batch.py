"""
Batch token analysis functionality.

Processes multiple tokens from files and generates aggregate reports.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from tokenprobe.core.checks.active import ACTIVE_CHECKS
from tokenprobe.core.checks.engine import CheckExecutor, CheckRegistry
from tokenprobe.core.checks.static import STATIC_CHECKS
from tokenprobe.core.config import (
    TokenProbeConfig,
    apply_severity_overrides,
    build_config_checks,
    filter_checks_by_config,
)
from tokenprobe.core.decoder import DecodeError, decode_token
from tokenprobe.core.findings import Report
from tokenprobe.core.validation import validate_file_path
from tokenprobe.logging_config import ErrorLogger, PhaseLogger

_phase = PhaseLogger("batch")
_error = ErrorLogger("batch")


class BatchResult:
    """Result of batch token analysis."""

    def __init__(self):
        self.reports: list[tuple[Report, str]] = []
        self.errors: list[dict[str, Any]] = []
        self.total_tokens = 0
        self.processed_tokens = 0

    def add_report(self, report: Report, token_preview: str = ""):
        """Add a report for a successfully processed token."""
        self.reports.append((report, token_preview))
        self.processed_tokens += 1
        self.total_tokens += 1

    def add_error(self, token_preview: str, error: str):
        """Add an error for a failed token."""
        self.errors.append({"token": token_preview, "error": error})
        self.total_tokens += 1

    @property
    def total_findings(self) -> int:
        """Get total number of findings across all reports."""
        return sum(len(r.findings) for r, _ in self.reports)

    @property
    def severity_summary(self) -> dict[str, int]:
        """Get aggregated severity counts across all reports."""
        summary = {
            "critical": 0, "high": 0, "medium": 0, "low": 0, "info": 0,
        }
        for report, _ in self.reports:
            for finding in report.findings:
                summary[finding.severity.value] += 1
        return summary

    @property
    def success_rate(self) -> float:
        """Calculate success rate as percentage."""
        if self.total_tokens == 0:
            return 0.0
        return (self.processed_tokens / self.total_tokens) * 100

    @property
    def results(self) -> list[dict[str, Any]]:
        """Get combined list of all token results (reports + errors) in order."""
        combined: list[dict[str, Any]] = []
        for report, preview in self.reports:
            d = report.to_dict()
            d["token_preview"] = preview
            combined.append(d)
        for err in self.errors:
            combined.append({
                "token_preview": err["token"],
                "findings": [],
                "error": err["error"],
            })
        return combined

    def to_dict(self) -> dict[str, Any]:
        """Convert batch result to dictionary."""
        return {
            "total_tokens": self.total_tokens,
            "processed_tokens": self.processed_tokens,
            "failed_tokens": len(self.errors),
            "success_rate": self.success_rate,
            "total_findings": self.total_findings,
            "severity_summary": self.severity_summary,
            "reports": [r.to_dict() for r, _ in self.reports],
            "errors": self.errors,
        }


def load_tokens_from_file(file_path: Path) -> list[str]:
    """
    Load tokens from a file.

    Supports:
    - Plain text (one token per line)
    - JSON array of tokens
    - JSON object with 'tokens' array

    Args:
        file_path: Path to the tokens file.

    Returns:
        List of token strings.
    """
    _phase.start("Loading tokens from file", path=str(file_path))

    file_path = Path(validate_file_path(str(file_path)))
    if not file_path.exists():
        err = FileNotFoundError(f"Token file not found: {file_path}")
        _error.capture(err)
        _phase.end("File not found", success=False, error=err)
        raise err

    content = file_path.read_text().strip()

    # Try JSON first
    if content.startswith("[") or content.startswith("{"):
        try:
            data = json.loads(content)
            if isinstance(data, list):
                tokens = [str(t) for t in data]
            elif isinstance(data, dict) and "tokens" in data:
                tokens = [str(t) for t in data["tokens"]]
            else:
                raise ValueError("JSON must be an array or object with 'tokens' key")

            _phase.end("Loaded tokens from JSON", success=True, count=len(tokens))
            return tokens
        except json.JSONDecodeError:
            pass  # Fall through to line-by-line parsing

    # Line-by-line parsing
    tokens = []
    for _line_num, line in enumerate(content.split("\n"), 1):
        line = line.strip()
        if line and not line.startswith("#"):  # Skip empty lines and comments
            tokens.append(line)

    _phase.end("Loaded tokens from text", success=True, count=len(tokens))
    return tokens


def process_token(
    token: str,
    active: bool = False,
    target: str | None = None,
    pubkey_pem: str | None = None,
    config: TokenProbeConfig | None = None,
) -> Report:
    """
    Process a single token and return a report.

    Args:
        token: JWT token string.
        active: Whether to run active checks.
        target: Target URL for active checks.
        pubkey_pem: Public key PEM for active checks.
        config: Optional configuration.

    Returns:
        Report with findings.
    """
    report = Report()

    try:
        decoded = decode_token(token)
        report.token_valid_structure = True

        # Build registry
        registry = CheckRegistry()
        checks = list(STATIC_CHECKS)

        if active:
            checks.extend(ACTIVE_CHECKS)

        if config:
            checks.extend(build_config_checks(config))
            checks = filter_checks_by_config(checks, config)

        for check in checks:
            registry.register(check)

        # Execute checks
        executor = CheckExecutor(registry.all_checks())
        context = {}
        if active and target:
            context["target"] = target
            if pubkey_pem:
                context["pubkey_pem"] = pubkey_pem

        executor.execute_all(decoded, **context)

        # Get findings and apply overrides
        findings = executor.all_findings
        if config:
            findings = apply_severity_overrides(findings, config)

        for finding in findings:
            report.add_finding(finding)

        report.finalize()

    except DecodeError as e:
        report.token_valid_structure = False
        report.error = str(e)
        report.finalize()

    except Exception as e:
        _error.capture(e)
        report.token_valid_structure = False
        report.error = f"Unexpected error: {str(e)}"
        report.finalize()

    return report


def process_batch(
    tokens: list[str],
    active: bool = False,
    target: str | None = None,
    pubkey_pem: str | None = None,
    config: TokenProbeConfig | None = None,
) -> BatchResult:
    """
    Process multiple tokens in batch.

    Args:
        tokens: List of JWT token strings.
        active: Whether to run active checks.
        target: Target URL for active checks.
        pubkey_pem: Public key PEM for active checks.
        config: Optional configuration.

    Returns:
        BatchResult with all reports and errors.
    """
    _phase.start("Processing batch", token_count=len(tokens))

    result = BatchResult()

    for i, token in enumerate(tokens, 1):
        token_preview = token[:20] + "..." if len(token) > 20 else token
        _phase.info(f"Processing token {i}/{len(tokens)}", preview=token_preview)

        try:
            report = process_token(token, active, target, pubkey_pem, config)

            # Check if token structure was valid
            if report.token_valid_structure:
                result.add_report(report, token_preview)
            else:
                # Token couldn't be decoded - count as error
                result.add_error(token_preview, report.error or "Invalid token structure")
        except Exception as e:
            _error.capture(e, context={"token_index": i})
            result.add_error(token_preview, str(e))

    _phase.end(
        "Batch processing complete",
        success=True,
        total=result.total_tokens,
        processed=result.processed_tokens,
        errors=len(result.errors),
    )

    return result


def save_batch_result(result: BatchResult, output_path: Path):
    """
    Save batch result to JSON file.

    Args:
        result: BatchResult to save.
        output_path: Path to output file.
    """
    _phase.start("Saving batch result", path=str(output_path))

    output_path = Path(validate_file_path(str(output_path)))
    try:
        output_path.write_text(json.dumps(result.to_dict(), indent=2))
        _phase.end("Saved batch result", success=True)
    except Exception as e:
        _error.capture(e)
        _phase.end("Failed to save batch result", success=False, error=e)
        raise
