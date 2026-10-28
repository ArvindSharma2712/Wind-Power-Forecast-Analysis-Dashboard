"""
Dataset Switcher Router
Controls the active data ingestion mode between the January 2026 benchmark and the assets/ stream response.
"""

from fastapi import APIRouter, HTTPException
from ..core.config import settings
from ..data.repository import data_repository
from ..models.schemas import DatasetSwitchRequest

router = APIRouter(prefix=settings.API_PREFIX, tags=["Dataset Management"])


@router.get("/dataset/mode", summary="Get Active Dataset Mode")
async def get_dataset_mode():
    """Returns current active data mode."""
    return {
        "mode": data_repository.get_mode(),
        "availableModes": ["january-2026", "assets-stream"],
    }


@router.post("/dataset/switch", summary="Switch Active Dataset Mode")
async def switch_dataset_mode(req: DatasetSwitchRequest):
    """Switches active dataset mode between 'january-2026' and 'assets-stream'."""
    try:
        data_repository.set_mode(req.mode)
        active_records = data_repository.get_active_records()
        return {
            "status": "success",
            "activeMode": req.mode,
            "recordsCount": len(active_records),
            "metadata": data_repository.get_metadata(),
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
