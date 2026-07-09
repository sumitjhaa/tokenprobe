from __future__ import annotations

import os
import tempfile
from pathlib import Path

from fastapi import HTTPException, UploadFile

from backend.schemas import BatchResponse, BatchResultItem
from tokenprobe.core.batch import load_tokens_from_file, process_batch
from tokenprobe.core.checks.engine import CheckExecutor, CheckRegistry
from tokenprobe.core.checks.jwe import JWE_CHECKS
from tokenprobe.core.checks.static import STATIC_CHECKS
from tokenprobe.core.config import (
    apply_severity_overrides,
    build_config_checks,
    filter_checks_by_config,
    load_config,
)
from tokenprobe.core.findings import Report
from tokenprobe.core.unified_decoder import decode_jwt, is_jwe

DEBUG = os.getenv("DEBUG", "").lower() in ("1", "true", "yes")


def sanitize_error(msg: str) -> str:
    if DEBUG:
        return msg
    return msg.split("\n")[0][:200] if msg else "An internal error occurred"


def analyze_token(token: str, config_content: str | None = None) -> dict:
    config = None
    if config_content:
        with tempfile.NamedTemporaryFile(mode="w", suffix=".toml", delete=True) as f:
            f.write(config_content)
            f.flush()
            config = load_config(f.name)

    report = Report()
    decoded = decode_jwt(token)
    report.token_valid_structure = True

    token_is_jwe = is_jwe(decoded)
    token_type = "jwe" if token_is_jwe else "jwt"

    checks = list(JWE_CHECKS) if token_is_jwe else list(STATIC_CHECKS)

    if config:
        checks.extend(build_config_checks(config))
        checks = filter_checks_by_config(checks, config)

    registry = CheckRegistry()
    for check in checks:
        registry.register(check)

    executor = CheckExecutor(registry.all_checks())
    executor.execute_all(decoded)

    findings = executor.all_findings
    if config:
        findings = apply_severity_overrides(findings, config)

    for finding in findings:
        report.add_finding(finding)

    report.finalize()

    return {
        "token_valid_structure": report.token_valid_structure,
        "token_type": token_type,
        "findings": report.to_dict().get("findings", []),
        "summary": report.to_dict().get("summary", {}),
        "exit_code": report.exit_code,
        "error": report.error,
    }


async def process_batch_upload(file: UploadFile) -> BatchResponse:
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    max_size = 10 * 1024 * 1024
    content = await file.read()
    if len(content) > max_size:
        raise HTTPException(
            status_code=413,
            detail=f"File too large ({len(content)} bytes, max {max_size})",
        )

    with tempfile.NamedTemporaryFile(mode="wb", suffix=".txt", delete=True) as f:
        f.write(content)
        f.flush()
        tokens = load_tokens_from_file(Path(f.name))

    if not tokens:
        raise HTTPException(status_code=400, detail="No tokens found in file")

    result = process_batch(tokens, active=False, target=None)

    items = [
        BatchResultItem(
            index=i,
            token_preview=token_result.get("token_preview", ""),
            findings=token_result.get("findings", []),
            error=token_result.get("error"),
        )
        for i, token_result in enumerate(result.results)
    ]

    return BatchResponse(
        total_tokens=result.total_tokens,
        processed_tokens=result.processed_tokens,
        failed=len(result.errors),
        success_rate=result.success_rate,
        total_findings=result.total_findings,
        severity_summary=result.severity_summary,
        results=items,
    )
