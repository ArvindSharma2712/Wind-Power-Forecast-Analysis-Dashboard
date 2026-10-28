"""
BMRS Assets Ingestion and Diagnostic Loader
Parses raw stream responses provided in the project assets/ directory:
1. Wind generation forecast (WINDFOR) stream_response_1793111592799.json (73 records)
2. Half-hourly generation outturn by fuel type (FUELHH) stream_response_1793113922664.json (RFC 9110 HTTP 400 response)
"""

import json
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, Any, List
from ..core.config import settings


def find_asset_files() -> Dict[str, Path]:
    """Finds WINDFOR and FUELHH stream responses in assets directory."""
    assets_dir = settings.ASSETS_DIR
    windfor_path = None
    fuelhh_path = None

    if assets_dir.exists():
        for file in assets_dir.glob("*.json"):
            filename = file.name
            if "WINDFOR" in filename or "Wind generation forecast" in filename:
                windfor_path = file
            elif "FUELHH" in filename or "Half-hourly generation outturn" in filename:
                fuelhh_path = file

    return {
        "windfor": windfor_path,
        "fuelhh": fuelhh_path,
    }


def load_bmrs_assets() -> Dict[str, Any]:
    """Loads raw assets and builds diagnostics."""
    paths = find_asset_files()
    windfor_records = []
    fuelhh_error = {}

    if paths["windfor"] and paths["windfor"].exists():
        with open(paths["windfor"], "r", encoding="utf-8") as f:
            windfor_records = json.load(f)

    if paths["fuelhh"] and paths["fuelhh"].exists():
        with open(paths["fuelhh"], "r", encoding="utf-8") as f:
            fuelhh_error = json.load(f)

    windfor_count = len(windfor_records)
    first_record = windfor_records[0] if windfor_records else {}
    last_record = windfor_records[-1] if windfor_records else {}

    diagnosis = {
        "httpStatus": fuelhh_error.get("status", 400),
        "errorTitle": fuelhh_error.get("title", "One or more validation errors occurred."),
        "errorDetails": fuelhh_error.get("errors", {}),
        "rootCause": (
            "The Elexon BMRS API returned an RFC 9110 HTTP 400 Bad Request error because "
            "both settlement date fields (settlementDateFrom/settlementDateTo) and publication "
            "date fields (publishDateTimeFrom/publishDateTimeTo) were simultaneously supplied."
        ),
        "ruleViolation": "Elexon BMRS API Rule: 'The Settlement Date fields cannot be set when a Publish Date field is set.'",
        "backendFix": (
            "Query FUELHH using solely settlementDateFrom and settlementDateTo (e.g., '2026-10-26' to '2026-10-29') "
            "and filter fuelType='WIND'. Omit publishDateTimeFrom and publishDateTimeTo."
        ),
        "suggestedEndpoint": "/bmrs/api/v1/datasets/FUELHH?settlementDateFrom=2026-10-26&settlementDateTo=2026-10-29&fuelType=WIND",
    }

    metadata = {
        "windforFilename": paths["windfor"].name if paths["windfor"] else "WINDFOR.json",
        "windforCount": windfor_count,
        "windforPublishTime": first_record.get("publishTime", "2026-10-27T11:30:00Z"),
        "windforStart": first_record.get("startTime", "2026-10-26T21:00:00Z"),
        "windforEnd": last_record.get("startTime", "2026-10-29T21:00:00Z"),
        "fuelhhFilename": paths["fuelhh"].name if paths["fuelhh"] else "FUELHH.json",
        "fuelhhStatus": fuelhh_error.get("status", 400),
        "fuelhhErrorMessage": fuelhh_error.get("errors", {}).get("", ["Unknown validation error"])[0] if fuelhh_error.get("errors") else "Unknown validation error",
        "isOriginalAssetsData": True,
        "diagnosis": diagnosis,
    }

    return {
        "windforRecords": windfor_records,
        "fuelhhError": fuelhh_error,
        "metadata": metadata,
    }


def transform_windfor_assets(windfor_records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Transforms raw WINDFOR JSON stream records into unified dashboard format."""
    transformed = []

    for index, item in enumerate(windfor_records):
        start_time_str = item.get("startTime", "")
        if not start_time_str:
            continue

        try:
            dt = datetime.fromisoformat(start_time_str.replace("Z", "+00:00"))
        except Exception:
            dt = datetime.strptime(start_time_str[:19], "%Y-%m-%dT%H:%M:%S")

        date_str = start_time_str[:10]
        total_mins = dt.hour * 60 + dt.minute
        settlement_period = (total_mins // 30) + 1

        end_dt = dt + timedelta(minutes=30)
        end_time_str = end_dt.strftime("%Y-%m-%dT%H:%M:%SZ")

        gen_val = float(item.get("generation", 0.0))

        transformed.append({
            "id": f"ASSET-WINDFOR-{index + 1}",
            "dateString": date_str,
            "settlementPeriod": settlement_period,
            "deliveryStartTime": start_time_str,
            "deliveryEndTime": end_time_str,
            "forecastPublicationTime": item.get("publishTime", "2026-10-27T11:30:00Z"),
            "decisionCutoff": "BMRS Live Stream Publish 11:30 UTC",
            "fuelType": "WIND",
            "forecastGeneration": gen_val,
            "actualGeneration": None,  # FUELHH returned HTTP 400 in assets/
            "signedError": None,
            "absoluteError": None,
            "isMissingActual": True,
            "isUnmatched": False,
            "isGenuineZero": False,
            "isFromAssetsFile": True,
            "qualityNote": "Actual generation unavailable: BMRS FUELHH query returned 400 parameter conflict",
        })

    return transformed
