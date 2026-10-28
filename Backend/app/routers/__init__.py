"""API Routers package."""
from .health import router as health_router
from .analysis import router as analysis_router
from .timeseries import router as timeseries_router
from .forecasts import router as forecasts_router
from .quality import router as quality_router
from .bmrs import router as bmrs_router
from .auth import router as auth_router
from .dataset import router as dataset_router

__all__ = [
    "health_router",
    "analysis_router",
    "timeseries_router",
    "forecasts_router",
    "quality_router",
    "bmrs_router",
    "auth_router",
    "dataset_router",
]
