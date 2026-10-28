"""
Analysis and KPI Statistical Router
Computes overall evaluation metrics, daily aggregations, diurnal profiles, and error distributions.
"""

from typing import Optional
from datetime import datetime
import pandas as pd
from fastapi import APIRouter, Query
from ..core.config import settings
from ..data.repository import data_repository
from ..services.metrics_engine import metrics_engine
from ..models.schemas import AnalysisResponse

router = APIRouter(prefix=settings.API_PREFIX, tags=["Analysis & Metrics"])


@router.get("/analysis", response_model=AnalysisResponse, summary="Get Accuracy Analytics & KPI Metrics")
async def get_analysis_metrics(
    startDate: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    endDate: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
):
    """Calculates comprehensive forecast accuracy metrics across requested date range."""
    mode = data_repository.get_mode()

    # Apply default dates if none supplied
    effective_start = startDate or ("2026-10-26" if mode == "assets-stream" else "2026-01-01")
    effective_end = endDate or ("2026-10-29" if mode == "assets-stream" else "2026-01-31")

    filtered_df = data_repository.filter_dataframe(start_date=effective_start, end_date=effective_end)

    try:
        d_start = datetime.strptime(effective_start, "%Y-%m-%d")
        d_end = datetime.strptime(effective_end, "%Y-%m-%d")
        total_days = max(1, (d_end - d_start).days + 1)
    except Exception:
        total_days = 31

    expected_intervals = total_days * 48

    overall = metrics_engine.compute_overall_metrics(filtered_df, expected_intervals=expected_intervals)
    daily = metrics_engine.compute_daily_metrics(filtered_df)
    best_day, worst_day = metrics_engine.find_best_and_worst_days(daily)
    distribution = metrics_engine.compute_error_distribution(filtered_df)
    diurnal = metrics_engine.compute_diurnal_profile(filtered_df)

    # Top 10 significant forecast errors
    matched_df = metrics_engine.get_matched_dataframe(filtered_df)
    if not matched_df.empty:
        sorted_matched = matched_df.sort_values(by="absoluteError", ascending=False)
        significant_errors = [
            {k: (None if pd.isna(v) else v) for k, v in r.items()}
            for r in sorted_matched.head(10).to_dict(orient="records")
        ]
    else:
        significant_errors = []

    metadata = {
        **data_repository.get_metadata(),
        "queryPeriod": {"startDate": effective_start, "endDate": effective_end},
        "mode": mode,
        "totalDaysEvaluated": total_days,
        "expectedIntervals": expected_intervals,
    }

    return AnalysisResponse(
        metadata=metadata,
        overall=overall,
        daily=daily,
        bestDay=best_day,
        worstDay=worst_day,
        distribution=distribution,
        diurnal=diurnal,
        significantErrors=significant_errors,
    )
