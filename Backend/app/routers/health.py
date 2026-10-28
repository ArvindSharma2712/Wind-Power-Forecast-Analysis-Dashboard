"""
Health Check and Root Status Endpoints
Provides system telemetry, backend version, Python/Pandas versions, and dataset health.
"""

import sys
from datetime import datetime, timezone
import pandas as pd
from fastapi import APIRouter
from ..core.config import settings
from ..data.repository import data_repository
from ..models.schemas import HealthResponse

router = APIRouter(tags=["Health & Status"])


@router.get("/", summary="API Root & Service Overview")
async def root():
    """Provides human-readable overview of the WindInsight backend service."""
    return {
        "title": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "description": settings.DESCRIPTION,
        "status": "online",
        "evaluationPeriod": f"{settings.EVALUATION_START} to {settings.EVALUATION_END}",
        "market": "UK Electricity Market (NGET / Elexon BSC)",
        "timezone": settings.TIMEZONE,
        "docsUrl": "/docs",
        "activeMode": data_repository.get_mode(),
        "endpoints": {
            "health": f"{settings.API_PREFIX}/health",
            "analysis": f"{settings.API_PREFIX}/analysis",
            "timeseries": f"{settings.API_PREFIX}/timeseries",
            "forecasts": f"{settings.API_PREFIX}/forecasts",
            "forecastsExport": f"{settings.API_PREFIX}/forecasts/export",
            "quality": f"{settings.API_PREFIX}/quality",
            "bmrsAssets": f"{settings.API_PREFIX}/bmrs/assets",
            "bmrsDiagnose": f"{settings.API_PREFIX}/bmrs/diagnose",
            "authLogin": f"{settings.API_PREFIX}/auth/login",
            "datasetSwitch": f"{settings.API_PREFIX}/dataset/switch",
        },
    }


@router.get(f"{settings.API_PREFIX}/health", response_model=HealthResponse, summary="API Health Check")
async def health_check():
    """Returns operational health, dataset state, and execution environment."""
    mode = data_repository.get_mode()
    active_records = data_repository.get_active_records()

    if mode == "assets-stream":
        msg = "Serving real Elexon BMRS WINDFOR stream response from assets/ (73 records)"
    else:
        msg = f"Serving January 2026 challenge evaluation benchmark dataset ({len(active_records)} settlement periods)"

    return HealthResponse(
        status="ok",
        mode=mode,
        version=settings.VERSION,
        message=msg,
        backendConnected=True,
        pythonVersion=sys.version.split()[0],
        pandasVersion=pd.__version__,
        recordsCount=len(active_records),
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
