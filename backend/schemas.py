from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field

MAX_TOKEN_LENGTH = 100_000
MAX_CONFIG_LENGTH = 50_000


class AnalyzeRequest(BaseModel):
    token: str = Field(
        ..., max_length=MAX_TOKEN_LENGTH,
        description="JWT or JWE token to analyze",
    )
    config: str | None = Field(
        None, max_length=MAX_CONFIG_LENGTH,
        description="TOML configuration content",
    )


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


class ConfigValidateRequest(BaseModel):
    config: str = Field(..., max_length=MAX_CONFIG_LENGTH)


class ConfigValidateResponse(BaseModel):
    valid: bool
    error: str | None = None
