"""
Data Quality and Integrity Audit Router
Provides interval coverage audit, telemetry gap isolation, and zero-generation distinction.
"""

from typing import Optional
from fastapi import APIRouter, Query
from ..core.config import settings
from ..data.repository import data_repository
from ..services.data_quality import data_quality_auditor
from ..models.schemas import DataQualityReport

router = APIRouter(prefix=settings.API_PREFIX, tags=["Data Quality & Audit"])


@router.get("/quality", response_model=DataQualityReport, summary="Get Data Quality & Coverage Audit Report")
async def get_data_quality_report(
    startDate: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    endDate: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
):
    """Executes data completeness, missing telemetry, and BMRS feed audits."""
    mode = data_repository.get_mode()
    effective_start = startDate or ("2026-10-26" if mode == "assets-stream" else "2026-01-01")
    effective_end = endDate or ("2026-10-29" if mode == "assets-stream" else "2026-01-31")

    filtered_df = data_repository.filter_dataframe(start_date=effective_start, end_date=effective_end)
    report = data_quality_auditor.generate_quality_report(
        df=filtered_df,
        start_date=effective_start,
        end_date=effective_end,
    )
    return report
