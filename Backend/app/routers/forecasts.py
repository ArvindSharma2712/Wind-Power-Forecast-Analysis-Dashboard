"""
Forecast Explorer & Data Export Router
Provides searchable, filterable, paginated settlement records and CSV data export.
"""

from typing import Optional
import io
import math
from fastapi import APIRouter, Query, Response
from fastapi.responses import StreamingResponse
import pandas as pd
from ..core.config import settings
from ..data.repository import data_repository
from ..models.schemas import ForecastExplorerResponse, PaginationInfo

router = APIRouter(prefix=settings.API_PREFIX, tags=["Forecast Explorer"])


def apply_explorer_filters(
    df: pd.DataFrame,
    settlement_period: str = "all",
    search: str = "",
    error_filter: str = "all",
    sort_by: str = "deliveryStartTime",
    sort_order: str = "asc",
) -> pd.DataFrame:
    """Applies settlement period, search, error category filters and sorting."""
    if df.empty:
        return df

    filtered = df.copy()

    # Settlement period filter
    if settlement_period and settlement_period != "all":
        try:
            sp_num = int(settlement_period)
            filtered = filtered[filtered["settlementPeriod"] == sp_num]
        except ValueError:
            pass

    # Error category filter
    if error_filter == "missing_actual":
        filtered = filtered[filtered["isMissingActual"] == True]
    elif error_filter == "high_error":
        filtered = filtered[filtered["absoluteError"].notna() & (filtered["absoluteError"] >= 1500.0)]
    elif error_filter == "moderate_error":
        filtered = filtered[
            filtered["absoluteError"].notna() &
            (filtered["absoluteError"] >= 500.0) &
            (filtered["absoluteError"] < 1500.0)
        ]
    elif error_filter == "low_error":
        filtered = filtered[filtered["absoluteError"].notna() & (filtered["absoluteError"] < 500.0)]

    # Search filter
    if search and search.strip():
        q = search.strip().lower()
        id_match = filtered["id"].str.lower().str.contains(q, na=False)
        date_match = filtered["dateString"].str.contains(q, na=False)
        sp_match = filtered["settlementPeriod"].astype(str).str.contains(q, na=False)
        note_match = (
            filtered["qualityNote"].str.lower().str.contains(q, na=False)
            if "qualityNote" in filtered.columns
            else pd.Series(False, index=filtered.index)
        )
        filtered = filtered[id_match | date_match | sp_match | note_match]

    # Sorting
    if sort_by in filtered.columns:
        ascending = sort_order.lower() == "asc"
        filtered = filtered.sort_values(by=sort_by, ascending=ascending, na_position="last")

    return filtered


@router.get("/forecasts", response_model=ForecastExplorerResponse, summary="Get Paginated & Filtered Forecast Records")
async def get_forecast_records(
    startDate: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    endDate: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    settlementPeriod: str = Query("all", description="Settlement Period (1-48 or 'all')"),
    search: str = Query("", description="Search term for ID, Date, SP, or note"),
    errorFilter: str = Query("all", pattern="^(all|missing_actual|high_error|moderate_error|low_error)$"),
    sortBy: str = Query("deliveryStartTime", description="Field to sort by"),
    sortOrder: str = Query("asc", pattern="^(asc|desc)$"),
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    pageSize: int = Query(20, ge=1, le=500, description="Page size"),
):
    """Retrieves paginated settlement records with interactive filtering for table exploration."""
    mode = data_repository.get_mode()
    effective_start = startDate or ("2026-10-26" if mode == "assets-stream" else "2026-01-01")
    effective_end = endDate or ("2026-10-29" if mode == "assets-stream" else "2026-01-31")

    base_df = data_repository.filter_dataframe(start_date=effective_start, end_date=effective_end)
    filtered_df = apply_explorer_filters(
        base_df,
        settlement_period=settlementPeriod,
        search=search,
        error_filter=errorFilter,
        sort_by=sortBy,
        sort_order=sortOrder,
    )

    total = len(filtered_df)
    total_pages = max(1, math.ceil(total / pageSize))
    start_idx = (page - 1) * pageSize
    end_idx = start_idx + pageSize

    paginated_df = filtered_df.iloc[start_idx:end_idx]
    records = [
        {k: (None if pd.isna(v) else v) for k, v in r.items()}
        for r in paginated_df.to_dict(orient="records")
    ]

    return ForecastExplorerResponse(
        records=records,
        pagination=PaginationInfo(
            page=page,
            pageSize=pageSize,
            total=total,
            totalPages=total_pages,
        ),
        dataMode=mode,
    )


@router.get("/forecasts/export", summary="Export Forecasts to CSV")
async def export_forecasts_csv(
    startDate: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    endDate: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    settlementPeriod: str = Query("all", description="Settlement Period (1-48 or 'all')"),
    search: str = Query("", description="Search term"),
    errorFilter: str = Query("all", pattern="^(all|missing_actual|high_error|moderate_error|low_error)$"),
    sortBy: str = Query("deliveryStartTime", description="Sort by field"),
    sortOrder: str = Query("asc", pattern="^(asc|desc)$"),
):
    """Exports matching forecast and actual outturn settlement records as a downloadable CSV."""
    mode = data_repository.get_mode()
    effective_start = startDate or ("2026-10-26" if mode == "assets-stream" else "2026-01-01")
    effective_end = endDate or ("2026-10-29" if mode == "assets-stream" else "2026-01-31")

    base_df = data_repository.filter_dataframe(start_date=effective_start, end_date=effective_end)
    filtered_df = apply_explorer_filters(
        base_df,
        settlement_period=settlementPeriod,
        search=search,
        error_filter=errorFilter,
        sort_by=sortBy,
        sort_order=sortOrder,
    )

    # Prepare export dataframe with clean headers
    export_df = filtered_df[[
        "id", "dateString", "settlementPeriod", "deliveryStartTime", "deliveryEndTime",
        "forecastPublicationTime", "decisionCutoff", "forecastGeneration", "actualGeneration",
        "signedError", "absoluteError", "isMissingActual", "isGenuineZero", "qualityNote"
    ]].copy()

    export_df.columns = [
        "Record ID", "Settlement Date", "Settlement Period", "Delivery Start (GMT)", "Delivery End (GMT)",
        "Forecast Published (GMT)", "Decision Cutoff Gate", "Day-Ahead Forecast (MW)", "Actual Outturn (MW)",
        "Signed Error (MW)", "Absolute Error (MW)", "Missing Actual", "Genuine Zero", "Audit Note"
    ]

    csv_buffer = io.StringIO()
    export_df.to_csv(csv_buffer, index=False)
    csv_bytes = csv_buffer.getvalue().encode("utf-8")

    filename = f"wind_power_forecast_export_{effective_start}_{effective_end}.csv"

    return StreamingResponse(
        io.BytesIO(csv_bytes),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )
