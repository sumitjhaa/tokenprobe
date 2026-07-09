from fastapi import APIRouter, HTTPException, UploadFile

from backend.schemas import BatchResponse
from backend.services import process_batch_upload, sanitize_error

router = APIRouter(prefix="/api", tags=["batch"])


@router.post("/analyze/batch", response_model=BatchResponse)
async def analyze_batch(file: UploadFile):
    try:
        return await process_batch_upload(file)
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=sanitize_error(str(e))) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=sanitize_error(str(e))) from e
