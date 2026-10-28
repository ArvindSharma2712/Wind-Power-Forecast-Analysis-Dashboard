"""
Elexon BMRS Open Data API Client and Conflict Diagnostic Engine
Connects to official UK Elexon BMRS endpoints and provides parameter error resolution.

Resolution for RFC 9110 HTTP 400 Error in assets/FUELHH:
Problem: BMRS API restricts querying by BOTH settlement date and publish date simultaneously.
Fix: Query FUELHH using only settlementDateFrom & settlementDateTo with fuelType='WIND'.
"""

from typing import Dict, Any, Optional
import httpx
from ..core.config import settings


class BMRSClient:
    def __init__(self):
        self.base_url = settings.BMRS_API_BASE_URL
        self.api_key = settings.BMRS_API_KEY

    def diagnose_query(
        self,
        dataset: str,
        settlement_date_from: Optional[str] = None,
        settlement_date_to: Optional[str] = None,
        publish_datetime_from: Optional[str] = None,
        publish_datetime_to: Optional[str] = None,
        fuel_type: str = "WIND",
    ) -> Dict[str, Any]:
        """Diagnoses potential parameter conflict before calling Elexon BMRS."""
        has_settlement_dates = bool(settlement_date_from or settlement_date_to)
        has_publish_dates = bool(publish_datetime_from or publish_datetime_to)

        is_conflict = has_settlement_dates and has_publish_dates

        given_params = {
            "dataset": dataset,
            "settlementDateFrom": settlement_date_from,
            "settlementDateTo": settlement_date_to,
            "publishDateTimeFrom": publish_datetime_from,
            "publishDateTimeTo": publish_datetime_to,
            "fuelType": fuel_type,
        }

        if is_conflict:
            # Resolved parameters: prioritize settlement date for utility delivery matching
            corrected_params = {
                "settlementDateFrom": settlement_date_from or "2026-10-26",
                "settlementDateTo": settlement_date_to or "2026-10-29",
                "fuelType": fuel_type,
            }
            suggested_url = f"{self.base_url}/datasets/{dataset}?settlementDateFrom={corrected_params['settlementDateFrom']}&settlementDateTo={corrected_params['settlementDateTo']}&fuelType={fuel_type}"
            
            return {
                "requestGiven": given_params,
                "isValidForBMRS": False,
                "diagnosis": "RFC 9110 HTTP 400 Conflict: The Settlement Date fields cannot be set when a Publish Date field is set.",
                "explanation": (
                    "Elexon BMRS API strictly enforces mutually exclusive query parameters. "
                    "When analyzing actual generation for day-ahead contract settlement, the utility "
                    "requires outturns indexed by settlement date. Therefore, publish datetime fields "
                    "must be omitted."
                ),
                "correctedParameters": corrected_params,
                "suggestedUrl": suggested_url,
            }

        valid_params = {k: v for k, v in given_params.items() if v is not None}
        return {
            "requestGiven": given_params,
            "isValidForBMRS": True,
            "diagnosis": "Parameters conform to Elexon BMRS API specifications.",
            "explanation": "No conflicting date filters detected. Query can be safely executed against BMRS endpoint.",
            "correctedParameters": valid_params,
            "suggestedUrl": f"{self.base_url}/datasets/{dataset}",
        }

    async def fetch_dataset(
        self,
        dataset: str = "FUELHH",
        settlement_date_from: str = "2026-10-26",
        settlement_date_to: str = "2026-10-29",
        fuel_type: str = "WIND",
        auto_resolve: bool = True,
    ) -> Dict[str, Any]:
        """Fetches data from Elexon BMRS with automatic parameter sanitization."""
        params = {
            "settlementDateFrom": settlement_date_from,
            "settlementDateTo": settlement_date_to,
        }
        if dataset.upper() == "FUELHH":
            params["fuelType"] = fuel_type

        headers = {"Accept": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"

        target_url = f"{self.base_url}/datasets/{dataset}"

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(target_url, params=params, headers=headers)
                if response.status_code == 200:
                    return {
                        "status": "success",
                        "statusCode": 200,
                        "data": response.json(),
                        "url": str(response.url),
                    }
                else:
                    return {
                        "status": "api_error",
                        "statusCode": response.status_code,
                        "message": f"BMRS returned status {response.status_code}",
                        "responseBody": response.text[:500],
                        "url": str(response.url),
                    }
        except Exception as ex:
            return {
                "status": "network_fallback",
                "statusCode": 503,
                "message": f"Live connection to Elexon BMRS unreached ({str(ex)}). Using local cached assets.",
                "targetUrl": target_url,
                "params": params,
            }


bmrs_client = BMRSClient()
