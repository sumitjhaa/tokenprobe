from fastapi import APIRouter, HTTPException

from backend.schemas import AnalyzeRequest, AnalyzeResponse
from backend.services import analyze_token, sanitize_error
from tokenprobe.core.decoder import DecodeError
from tokenprobe.core.jwe_decoder import JWEDecodeError

router = APIRouter(prefix="/api", tags=["analysis"])


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(req: AnalyzeRequest):
    try:
        return analyze_token(req.token, req.config)
    except (ValueError, DecodeError, JWEDecodeError) as e:
        raise HTTPException(status_code=400, detail=sanitize_error(str(e))) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=sanitize_error(str(e))) from e


@router.post("/analyze/jwe", response_model=AnalyzeResponse)
async def analyze_jwe(req: AnalyzeRequest):
    try:
        result = analyze_token(req.token, req.config)
        if result["token_type"] != "jwe":
            result["error"] = "Token is not a JWE (expected 5-part structure)"
        return result
    except (ValueError, DecodeError, JWEDecodeError) as e:
        raise HTTPException(status_code=400, detail=sanitize_error(str(e))) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=sanitize_error(str(e))) from e
