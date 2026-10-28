"""
Unit Tests for Data Quality and Integrity Auditing
Verifies coverage calculations, missing observation logging, and zero-generation tracking.
"""

import pandas as pd
from app.services.data_quality import DataQualityAuditor


def test_quality_auditor_report_generation():
    """Verifies that quality report accurately counts observations and generates anomaly logs."""
    test_records = [
        # Normal matched interval
        {"id": "R1", "deliveryStartTime": "2026-01-01T00:00:00Z", "settlementPeriod": 1, "forecastGeneration": 1000.0, "actualGeneration": 1050.0, "isMissingActual": False, "isUnmatched": False, "isGenuineZero": False, "qualityNote": None},
        # Genuine zero interval
        {"id": "R2", "deliveryStartTime": "2026-01-01T00:30:00Z", "settlementPeriod": 2, "forecastGeneration": 100.0, "actualGeneration": 0.0, "isMissingActual": False, "isUnmatched": False, "isGenuineZero": True, "qualityNote": "Calm wind event"},
        # Missing actual observation
        {"id": "R3", "deliveryStartTime": "2026-01-01T01:00:00Z", "settlementPeriod": 3, "forecastGeneration": 1500.0, "actualGeneration": None, "isMissingActual": True, "isUnmatched": False, "isGenuineZero": False, "qualityNote": "SCADA link drop"},
        # Unmatched boundary record
        {"id": "R4", "deliveryStartTime": "2026-01-01T01:30:00Z", "settlementPeriod": 4, "forecastGeneration": 1200.0, "actualGeneration": None, "isMissingActual": False, "isUnmatched": True, "isGenuineZero": False, "qualityNote": "Post gate closure"},
    ]

    df = pd.DataFrame(test_records)
    report = DataQualityAuditor.generate_quality_report(df, "2026-01-01", "2026-01-01")

    summary = report["summary"]
    assert summary["totalForecastRecords"] == 4
    assert summary["matchedDeliveryIntervals"] == 2
    assert summary["missingActualObservations"] == 1
    assert summary["genuineZeroObservations"] == 1
    assert summary["unmatchedForecastRecords"] == 1

    logs = report["qualityLogs"]
    assert len(logs) == 3

    log_types = [l["type"] for l in logs]
    assert "Missing Actual Generation" in log_types
    assert "Zero Generation Event" in log_types
    assert "Unmatched Forecast Record" in log_types
