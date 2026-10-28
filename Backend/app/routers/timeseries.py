"""
Time-Series Data Generation Router
Supports 30-minute settlement period resolution, hourly buckets, and daily aggregates.
"""

from typing import List, Optional
from fastapi import APIRouter, Query
from ..core.config import settings
from ..data.repository import data_repository
from ..services.metrics_engine import metrics_engine
from ..models.schemas import TimeSeriesItem

router = APIRouter(prefix=settings.API_PREFIX, tags=["Time-Series Data"])


@router.get("/timeseries", response_model=List[TimeSeriesItem], summary="Get Time-Series Forecast & Actual Data")
async def get_time_series(
    startDate: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    endDate: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    aggregation: str = Query("30min", pattern="^(30min|hourly|daily)$", description="Aggregation level"),
):
    """Returns dual-series generation and error curves for Recharts charts."""
    mode = data_repository.get_mode()
    effective_start = startDate or ("2026-10-26" if mode == "assets-stream" else "2026-01-01")
    effective_end = endDate or ("2026-10-29" if mode == "assets-stream" else "2026-01-31")

    filtered_df = data_repository.filter_dataframe(start_date=effective_start, end_date=effective_end)
    timeseries_data = metrics_engine.compute_timeseries(filtered_df, aggregation=aggregation)
    return timeseries_data
