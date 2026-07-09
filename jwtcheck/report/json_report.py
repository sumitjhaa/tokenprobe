"""
Machine-readable JSON report generation.

Produces structured JSON output for integration with other tools,
CI pipelines, and automated analysis systems.
"""

from __future__ import annotations

import json
import sys

from jwtcheck.core.findings import Report
from jwtcheck.logging_config import PhaseLogger

_phase = PhaseLogger("json_report")


def render_json_report(report: Report, file=None) -> None:
    """
    Render a machine-readable JSON report.

    Args:
        report: The analysis report to render.
        file: File object to write to (defaults to sys.stdout).
    """
    _phase.start("Rendering JSON report", findings_count=len(report.findings))

    if file is None:
        file = sys.stdout

    report_dict = report.to_dict()
    json_output = json.dumps(report_dict, indent=2, ensure_ascii=False)

    file.write(json_output)
    file.write("\n")
    file.flush()

    _phase.end("JSON report rendered", success=True)


def render_json_to_string(report: Report) -> str:
    """
    Render a JSON report as a string.

    Args:
        report: The analysis report to render.

    Returns:
        JSON string representation of the report.
    """
    _phase.start("Rendering JSON to string", findings_count=len(report.findings))

    report_dict = report.to_dict()
    json_output = json.dumps(report_dict, indent=2, ensure_ascii=False)

    _phase.end("JSON string rendered", success=True)
    return json_output
