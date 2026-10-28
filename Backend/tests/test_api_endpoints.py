"""
Integration Tests for FastAPI API Endpoints
Tests all API routes using TestClient: health, analysis, timeseries, forecasts, quality, bmrs, auth.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.data.repository import data_repository

client = TestClient(app)


@pytest.fixture(autouse=True)
def ensure_default_mode():
    """Ensure tests run with default benchmark dataset."""
    data_repository.set_mode("january-2026")


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "WindInsight" in data["title"]


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["backendConnected"] is True
    assert data["recordsCount"] == 1488


def test_analysis_endpoint():
    response = client.get("/api/analysis?startDate=2026-01-01&endDate=2026-01-31")
    assert response.status_code == 200
    data = response.json()

    assert "overall" in data
    assert "daily" in data
    assert "distribution" in data
    assert "diurnal" in data
    assert len(data["daily"]) == 31
    assert len(data["diurnal"]) == 48

    overall = data["overall"]
    assert overall["mae"] > 0
    assert overall["rmse"] > 0
    assert overall["totalMatchedIntervals"] > 1400


def test_timeseries_endpoint():
    # 30min aggregation
    res_30m = client.get("/api/timeseries?startDate=2026-01-01&endDate=2026-01-02&aggregation=30min")
    assert res_30m.status_code == 200
    data_30m = res_30m.json()
    assert len(data_30m) == 96  # 2 days * 48 SPs

    # Hourly aggregation
    res_hr = client.get("/api/timeseries?startDate=2026-01-01&endDate=2026-01-02&aggregation=hourly")
    assert res_hr.status_code == 200
    data_hr = res_hr.json()
    assert len(data_hr) == 48  # 2 days * 24 hours

    # Daily aggregation
    res_daily = client.get("/api/timeseries?startDate=2026-01-01&endDate=2026-01-07&aggregation=daily")
    assert res_daily.status_code == 200
    data_daily = res_daily.json()
    assert len(data_daily) == 7


def test_forecasts_explorer_and_export():
    # Paginated explorer
    res_explorer = client.get("/api/forecasts?page=1&pageSize=20")
    assert res_explorer.status_code == 200
    data = res_explorer.json()
    assert len(data["records"]) == 20
    assert data["pagination"]["total"] == 1488

    # Filtered by settlement period
    res_sp = client.get("/api/forecasts?settlementPeriod=12")
    assert res_sp.status_code == 200
    assert all(r["settlementPeriod"] == 12 for r in res_sp.json()["records"])

    # CSV Export
    res_export = client.get("/api/forecasts/export?startDate=2026-01-01&endDate=2026-01-02")
    assert res_export.status_code == 200
    assert "text/csv" in res_export.headers.get("content-type", "")
    assert "attachment; filename=" in res_export.headers.get("content-disposition", "")
    content = res_export.text
    assert "Settlement Date" in content
    assert "Day-Ahead Forecast (MW)" in content


def test_quality_endpoint():
    response = client.get("/api/quality?startDate=2026-01-01&endDate=2026-01-31")
    assert response.status_code == 200
    data = response.json()
    assert "summary" in data
    assert "qualityLogs" in data
    assert data["summary"]["missingActualObservations"] > 0
    assert data["summary"]["genuineZeroObservations"] > 0


def test_bmrs_assets_and_diagnose():
    # Assets inspect
    res_assets = client.get("/api/bmrs/assets")
    assert res_assets.status_code == 200
    data = res_assets.json()
    assert "metadata" in data
    assert data["metadata"]["windforCount"] == 73

    # Diagnose conflict
    conflict_payload = {
        "dataset": "FUELHH",
        "settlementDateFrom": "2026-10-26",
        "settlementDateTo": "2026-10-29",
        "publishDateTimeFrom": "2026-10-27T00:00:00Z",
    }
    res_diag = client.post("/api/bmrs/diagnose", json=conflict_payload)
    assert res_diag.status_code == 200
    diag_data = res_diag.json()
    assert diag_data["isValidForBMRS"] is False
    assert "RFC 9110 HTTP 400" in diag_data["diagnosis"]
    assert "publishDateTimeFrom" not in diag_data["correctedParameters"]


def test_auth_login():
    payload = {
        "email": "trader@uk-utility.co.uk",
        "password": "secret_password",
        "role": "Day-Ahead Energy Trader",
    }
    response = client.post("/api/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "token" in data
    assert data["user"]["role"] == "Day-Ahead Energy Trader"


def test_dataset_switch():
    # Switch to assets-stream
    switch_res = client.post("/api/dataset/switch", json={"mode": "assets-stream"})
    assert switch_res.status_code == 200
    assert switch_res.json()["activeMode"] == "assets-stream"

    # Verify health returns new mode
    health_res = client.get("/api/health")
    assert health_res.json()["mode"] == "assets-stream"
    assert health_res.json()["recordsCount"] == 73

    # Switch back to benchmark
    switch_back = client.post("/api/dataset/switch", json={"mode": "january-2026"})
    assert switch_back.status_code == 200
    assert switch_back.json()["activeMode"] == "january-2026"
