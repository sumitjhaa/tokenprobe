from __future__ import annotations

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routers.analysis import router as analysis_router
from backend.routers.batch import router as batch_router
from backend.routers.config import router as config_router
from backend.routers.health import router as health_router

app = FastAPI(
    title="TokenProbe API",
    description="REST API for JWT security analysis",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(analysis_router)
app.include_router(batch_router)
app.include_router(config_router)
