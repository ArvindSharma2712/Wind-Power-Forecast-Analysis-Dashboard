"""
Elexon BMRS Live Asset Ingest and Diagnostic Router
Handles raw assets inspection, parameter conflict resolution (RFC 9110 HTTP 400), and live querying.
"""

from fastapi import APIRouter
from ..core.config import settings
from ..data.repository import data_repository
from ..services.bmrs_client import bmrs_client
from ..models.schemas import BMRSQueryRequest, BMRSDiagnosisResponse

router = APIRouter(prefix=settings.API_PREFIX, tags=["Elexon BMRS Ingestion & Diagnostics"])


@router.get("/bmrs/assets", summary="Inspect Original Assets Files & Diagnostics")
async def get_raw_bmrs_assets():
    """Inspects the raw WINDFOR stream response and FUELHH RFC 9110 HTTP 400 error from assets/."""
    return data_repository.get_raw_assets()


@router.post("/bmrs/diagnose", response_model=BMRSDiagnosisResponse, summary="Diagnose BMRS Query Parameters")
async def diagnose_bmrs_parameters(query: BMRSQueryRequest):
    """Diagnoses parameter conflicts (e.g., settlement date vs publish date) and returns the valid Elexon BMRS query structure."""
    result = bmrs_client.diagnose_query(
        dataset=query.dataset,
        settlement_date_from=query.settlementDateFrom,
        settlement_date_to=query.settlementDateTo,
        publish_datetime_from=query.publishDateTimeFrom,
        publish_datetime_to=query.publishDateTimeTo,
    )
    return BMRSDiagnosisResponse(**result)


@router.post("/bmrs/fetch", summary="Live BMRS Dataset Query (Auto-Correcting)")
async def fetch_live_bmrs_data(query: BMRSQueryRequest):
    """Executes a sanitized live fetch against Elexon BMRS Open Data API, automatically stripping conflicting publish dates."""
    response = await bmrs_client.fetch_dataset(
        dataset=query.dataset,
        settlement_date_from=query.settlementDateFrom,
        settlement_date_to=query.settlementDateTo,
        auto_resolve=query.autoResolveConflicts,
    )
    return response
