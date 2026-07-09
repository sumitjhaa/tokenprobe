import tempfile

from fastapi import APIRouter

from backend.schemas import ConfigValidateRequest, ConfigValidateResponse

router = APIRouter(prefix="/api", tags=["config"])

CONFIG_SCHEMA = {
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


@router.get("/config/schema")
async def config_schema():
    return CONFIG_SCHEMA


@router.post("/config/validate", response_model=ConfigValidateResponse)
async def validate_config(req: ConfigValidateRequest):
    try:
        from tokenprobe.core.config import load_config
        with tempfile.NamedTemporaryFile(mode="w", suffix=".toml", delete=True) as f:
            f.write(req.config)
            f.flush()
            load_config(f.name)
        return ConfigValidateResponse(valid=True)
    except Exception as e:
        return ConfigValidateResponse(valid=False, error=str(e))
