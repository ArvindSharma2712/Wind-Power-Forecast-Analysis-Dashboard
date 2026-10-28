"""
Unit Tests for Mathematical Accuracy Formulations and Metrics Engine
Verifies MAE, RMSE, Signed Error (Bias), and Data Integrity rules.
"""

import math
import pytest
import pandas as pd
from app.services.metrics_engine import MetricsEngine


def test_mae_rmse_bias_calculations():
    """Verifies that MAE, RMSE, and Signed Error strictly conform to mathematical definitions."""
    # Test data: 4 intervals
    # Forecasts: [1000, 2000, 3000, 4000]
    # Actuals:   [1100, 1800, 3000, 4500]
    # Errors:    [-100, +200, 0,    -500]
    # AbsErrors: [100,  200,  0,    500] -> sum = 800 -> MAE = 800 / 4 = 200.0
    # SqErrors:  [10000, 40000, 0, 250000] -> sum = 300000 -> RMSE = sqrt(75000) = 273.86
    # Bias:      (-100 + 200 + 0 - 500) / 4 = -400 / 4 = -100.0
    test_df = pd.DataFrame([
        {"id": "1", "forecastGeneration": 1000.0, "actualGeneration": 1100.0, "dateString": "2026-01-01", "settlementPeriod": 1},
        {"id": "2", "forecastGeneration": 2000.0, "actualGeneration": 1800.0, "dateString": "2026-01-01", "settlementPeriod": 2},
        {"id": "3", "forecastGeneration": 3000.0, "actualGeneration": 3000.0, "dateString": "2026-01-01", "settlementPeriod": 3},
        {"id": "4", "forecastGeneration": 4000.0, "actualGeneration": 4500.0, "dateString": "2026-01-01", "settlementPeriod": 4},
    ])

    metrics = MetricsEngine.compute_overall_metrics(test_df, expected_intervals=4)

    assert metrics["n"] == 4
    assert metrics["mae"] == 200.0
    assert abs(metrics["rmse"] - 273.9) < 0.2
    assert metrics["meanSignedError"] == -100.0
    assert metrics["coveragePercent"] == 100.0
    assert metrics["biasDirection"] == "underforecasting"


def test_data_integrity_missing_actuals_excluded():
    """Verifies that missing actual observations (null / NaN) are strictly excluded from n."""
    test_df = pd.DataFrame([
        {"id": "1", "forecastGeneration": 1000.0, "actualGeneration": 1000.0, "dateString": "2026-01-01", "settlementPeriod": 1, "isMissingActual": False},
        {"id": "2", "forecastGeneration": 2000.0, "actualGeneration": None, "dateString": "2026-01-01", "settlementPeriod": 2, "isMissingActual": True},  # Missing actual
        {"id": "3", "forecastGeneration": 3000.0, "actualGeneration": 3000.0, "dateString": "2026-01-01", "settlementPeriod": 3, "isMissingActual": False},
    ])

    metrics = MetricsEngine.compute_overall_metrics(test_df, expected_intervals=3)

    # Only 2 records should be in n
    assert metrics["n"] == 2
    assert metrics["mae"] == 0.0
    assert metrics["rmse"] == 0.0
    assert metrics["missingActualCount"] == 1
    assert round(metrics["coveragePercent"], 1) == 66.7


def test_data_integrity_genuine_zero_included():
    """Verifies that genuine 0.0 MW actual observations ARE included in n."""
    test_df = pd.DataFrame([
        {"id": "1", "forecastGeneration": 200.0, "actualGeneration": 0.0, "dateString": "2026-01-01", "settlementPeriod": 1, "isGenuineZero": True, "isMissingActual": False},
        {"id": "2", "forecastGeneration": 0.0, "actualGeneration": 0.0, "dateString": "2026-01-01", "settlementPeriod": 2, "isGenuineZero": True, "isMissingActual": False},
    ])

    metrics = MetricsEngine.compute_overall_metrics(test_df, expected_intervals=2)

    assert metrics["n"] == 2
    assert metrics["mae"] == 100.0
    assert metrics["rmse"] == 141.4
    assert metrics["genuineZeroCount"] == 2


def test_daily_metrics_and_best_worst_days():
    """Verifies daily aggregation and best/worst day identification."""
    records = []
    # Day 1: 48 intervals with low error (MAE = 50 MW)
    for sp in range(1, 49):
        records.append({
            "id": f"D1-SP{sp}",
            "dateString": "2026-01-01",
            "settlementPeriod": sp,
            "forecastGeneration": 5050.0,
            "actualGeneration": 5000.0,
            "isMissingActual": False,
            "isUnmatched": False,
            "isGenuineZero": False,
        })
    # Day 2: 48 intervals with high error (MAE = 800 MW)
    for sp in range(1, 49):
        records.append({
            "id": f"D2-SP{sp}",
            "dateString": "2026-01-02",
            "settlementPeriod": sp,
            "forecastGeneration": 5800.0,
            "actualGeneration": 5000.0,
            "isMissingActual": False,
            "isUnmatched": False,
            "isGenuineZero": False,
        })

    df = pd.DataFrame(records)
    daily = MetricsEngine.compute_daily_metrics(df)

    assert len(daily) == 2
    assert daily[0]["mae"] == 50.0
    assert daily[1]["mae"] == 800.0

    best, worst = MetricsEngine.find_best_and_worst_days(daily)
    assert best["date"] == "2026-01-01"
    assert worst["date"] == "2026-01-02"
