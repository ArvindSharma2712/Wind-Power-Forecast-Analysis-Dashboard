"""
Unit Tests for Elexon BMRS Diagnostic Engine
Tests parameter conflict detection and auto-resolution for the RFC 9110 HTTP 400 error.
"""

from app.services.bmrs_client import BMRSClient


def test_bmrs_conflict_detection_and_resolution():
    client = BMRSClient()

    # Conflicting query: contains both settlementDateFrom and publishDateTimeFrom
    res = client.diagnose_query(
        dataset="FUELHH",
        settlement_date_from="2026-10-26",
        settlement_date_to="2026-10-29",
        publish_datetime_from="2026-10-27T11:30:00Z",
        fuel_type="WIND",
    )

    assert res["isValidForBMRS"] is False
    assert "RFC 9110 HTTP 400 Conflict" in res["diagnosis"]
    assert "publishDateTimeFrom" not in res["correctedParameters"]
    assert res["correctedParameters"]["settlementDateFrom"] == "2026-10-26"
    assert res["correctedParameters"]["fuelType"] == "WIND"
    assert "suggestedUrl" in res


def test_bmrs_valid_query_without_conflicts():
    client = BMRSClient()

    # Valid query: contains only settlement dates
    res = client.diagnose_query(
        dataset="FUELHH",
        settlement_date_from="2026-10-26",
        settlement_date_to="2026-10-29",
        fuel_type="WIND",
    )

    assert res["isValidForBMRS"] is True
    assert "conform to Elexon BMRS API specifications" in res["diagnosis"]
