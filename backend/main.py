from __future__ import annotations

import os
import tempfile
from typing import Any

from fastapi import FastAPI, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from tokenprobe.core.batch import process_batch
from tokenprobe.core.checks.engine import CheckExecutor, CheckRegistry
from tokenprobe.core.checks.jwe import JWE_CHECKS
from tokenprobe.core.checks.static import STATIC_CHECKS
from tokenprobe.core.config import (
    apply_severity_overrides,
    build_config_checks,
    filter_checks_by_config,
    load_config,
)
from tokenprobe.core.decoder import DecodeError
from tokenprobe.core.findings import Report
from tokenprobe.core.jwe_decoder import JWEDecodeError
from tokenprobe.core.unified_decoder import decode_jwt, is_jwe

app = FastAPI(
    title="TokenProbe API",
    description="REST API for JWT security analysis",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    token: str = Field(..., description="JWT or JWE token to analyze")
    config: str | None = Field(None, description="TOML configuration content")


class AnalyzeResponse(BaseModel):
    token_valid_structure: bool
    token_type: str
    findings: list[dict[str, Any]]
    summary: dict[str, int]
    exit_code: int
    error: str | None = None


class BatchResultItem(BaseModel):
    index: int
    token_preview: str
    findings: list[dict[str, Any]]
    error: str | None = None


class BatchResponse(BaseModel):
    total_tokens: int
    processed_tokens: int
    failed: int
    success_rate: float
    total_findings: int
    severity_summary: dict[str, int]
    results: list[BatchResultItem]


class HealthResponse(BaseModel):
    status: str
    version: str


def _make_report(token: str, config_content: str | None = None) -> dict[str, Any]:
    config = None
    if config_content:
        with tempfile.NamedTemporaryFile(mode="w", suffix=".toml", delete=False) as f:
            f.write(config_content)
            config_path = f.name
        try:
            config = load_config(config_path)
        finally:
            os.unlink(config_path)

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


@app.get("/health", response_model=HealthResponse)
async def health():
    return HealthResponse(status="ok", version="1.0.0")


@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze_token(req: AnalyzeRequest):
    try:
        result = _make_report(req.token, req.config)
        return result
    except (ValueError, DecodeError, JWEDecodeError) as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {e}") from e


@app.post("/api/analyze/batch", response_model=BatchResponse)
async def analyze_batch(file: UploadFile):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    try:
        content = await file.read()
        text = content.decode("utf-8")

        tokens = []
        for line in text.splitlines():
            line = line.strip()
            if line and not line.startswith("#"):
                tokens.append(line)

        if not tokens:
            raise HTTPException(status_code=400, detail="No tokens found in file")

        result = process_batch(tokens, active=False, target=None)

        items = []
        for i, (token, token_result) in enumerate(zip(tokens, result.results, strict=False)):
            items.append(
                BatchResultItem(
                    index=i,
                    token_preview=token[:40] + "..." if len(token) > 40 else token,
                    findings=token_result.get("findings", []),
                    error=token_result.get("error"),
                )
            )

        return BatchResponse(
            total_tokens=result.total_tokens,
            processed_tokens=result.processed_tokens,
            failed=len(result.errors),
            success_rate=result.success_rate,
            total_findings=result.total_findings,
            severity_summary=result.severity_summary,
            results=items,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch analysis failed: {e}") from e


@app.post("/api/analyze/jwe", response_model=AnalyzeResponse)
async def analyze_jwe(req: AnalyzeRequest):
    try:
        result = _make_report(req.token, req.config)
        if result["token_type"] != "jwe":
            result["error"] = "Token is not a JWE (expected 5-part structure)"
        return result
    except (ValueError, DecodeError, JWEDecodeError) as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"JWE analysis failed: {e}") from e


@app.get("/api/config/schema")
async def config_schema():
    return {
        "claims": {
            "required": {"type": "array", "items": {"type": "string"}, "description": "Required claim keys"},
        },
        "checks": {
            "disable": {"type": "array", "items": {"type": "string"}, "description": "Checks to disable"},
        },
        "severity_overrides": {
            "type": "object",
            "description": "Override severity per check key",
        },
        "custom_rules": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "claim": {"type": "string"},
                    "pattern": {"type": "string"},
                    "severity": {"type": "string"},
                    "message": {"type": "string"},
                },
            },
        },
    }


class ConfigValidateRequest(BaseModel):
    config: str = Field(..., description="TOML configuration content")


class ConfigValidateResponse(BaseModel):
    valid: bool
    error: str | None = None


@app.post("/api/config/validate", response_model=ConfigValidateResponse)
async def validate_config(req: ConfigValidateRequest):
    with tempfile.NamedTemporaryFile(mode="w", suffix=".toml", delete=False) as f:
        f.write(req.config)
        path = f.name
    try:
        load_config(path)
        return ConfigValidateResponse(valid=True)
    except Exception as e:
        return ConfigValidateResponse(valid=False, error=str(e))
    finally:
        os.unlink(path)
