# WindInsight Backend • Python 3.13 + FastAPI Analytics Engine

Decision-support backend for UK Electricity Utility day-ahead wind power forecast error analysis, live Elexon BMRS ingestion, and data quality auditing.

---

## 1. System Architecture & Tech Stack

- **Runtime & Language:** Python 3.13.6
- **Web Framework:** FastAPI 0.115.0 (Asynchronous, High-Performance, OpenAPI 3.1)
- **ASGI Server:** Uvicorn 0.30.5
- **Numerical & Data Processing:** Pandas 2.3.3 + NumPy 2.1.1 (Vectorized array calculations)
- **Data Validation & Typing:** Pydantic v2
- **Testing:** Pytest 9.2.0 (16 unit and integration test suites passing in < 2s)
- **Containerization:** Docker & Docker Compose

---

## 2. Directory Structure

```
Backend/
├── app/
│   ├── __init__.py
│   ├── main.py                     # Application entry point, CORS, and routers
│   ├── core/
│   │   ├── __init__.py
│   │   └── config.py               # Settings, directories, and CORS policies
│   ├── models/
│   │   ├── __init__.py
│   │   └── schemas.py              # Pydantic v2 schemas and data contracts
│   ├── data/
│   │   ├── __init__.py
│   │   ├── benchmark_generator.py  # 1,488 SP synthetic Jan 2026 generator
│   │   ├── asset_loader.py         # Ingestion of assets/ WINDFOR & FUELHH JSON
│   │   └── repository.py           # In-memory Pandas DataFrames & cache
│   ├── services/
│   │   ├── __init__.py
│   │   ├── metrics_engine.py       # MAE, RMSE, Signed Error, Diurnal engine
│   │   ├── data_quality.py         # Coverage audit & telemetry anomaly logger
│   │   └── bmrs_client.py          # Elexon BMRS Open Data API client & 400 fix
│   └── routers/
│       ├── __init__.py
│       ├── health.py               # GET / and GET /api/health
│       ├── analysis.py             # GET /api/analysis
│       ├── timeseries.py           # GET /api/timeseries
│       ├── forecasts.py            # GET /api/forecasts & /api/forecasts/export
│       ├── quality.py              # GET /api/quality
│       ├── bmrs.py                 # GET /api/bmrs/assets & /api/bmrs/diagnose
│       ├── auth.py                 # POST /api/auth/login & GET /api/auth/me
│       └── dataset.py              # POST /api/dataset/switch & GET /api/dataset/mode
├── tests/
│   ├── __init__.py
│   ├── test_metrics.py             # Math formulas (MAE, RMSE, Bias, zero-checks)
│   ├── test_data_quality.py        # Coverage & anomaly audit verification
│   ├── test_api_endpoints.py       # Full TestClient API integration test suite
│   └── test_bmrs_diagnostics.py    # Parameter conflict resolution for RFC 9110
├── Dockerfile                      # Production container image
├── docker-compose.yml              # Container orchestration
├── requirements.txt                # Pinned production dependencies
├── run_server.py                   # Convenience server launcher
└── README.md                       # Service documentation
```

---

## 3. Mathematical Formulations

### 1. Signed Error ($e_i$) & Systematic Bias
$$e_i = F_i - A_i$$
$$\text{Bias} = \frac{1}{n} \sum_{i=1}^{n} (F_i - A_i)$$
* $e_i > 0$: Overforecasting (utility contracted excess volume; potential surplus imbalance cost).
* $e_i < 0$: Underforecasting (utility contracted deficit volume; exposed to cash-out buy-back prices).

### 2. Absolute Error ($AE_i$) & Mean Absolute Error (MAE)
$$AE_i = |F_i - A_i|$$
$$\text{MAE} = \frac{1}{n} \sum_{i=1}^{n} |F_i - A_i|$$

### 3. Root Mean Squared Error (RMSE)
$$\text{RMSE} = \sqrt{\frac{1}{n} \sum_{i=1}^{n} (F_i - A_i)^2}$$
Penalizes severe forecast excursions (e.g. rapid Atlantic storm ramps) quadratically.

### 4. Data Quality & Exclusion Rules
* **$A_i = \text{null}$ (Missing Actual Telemetry):** Strictly excluded from $n$. Does not corrupt totals with artificial 0.0 errors.
* **$A_i = 0.0\text{ MW}$ (Genuine Calm Generation):** Preserved in $n$ as valid physical outturn.
* **Unmatched Forecast Records:** Intervals published after day-ahead gate closure (17:00 GMT on D-1) are excluded to prevent lookahead bias.

---

## 4. API Specification & Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Service root and API catalog |
| `GET` | `/api/health` | Health telemetry, active mode, Pandas/Python versions |
| `GET` | `/api/analysis` | Overall KPI metrics (MAE, RMSE, Bias), daily series, diurnal curve |
| `GET` | `/api/timeseries` | Generation curves with `aggregation=30min`, `hourly`, or `daily` |
| `GET` | `/api/forecasts` | Paginated, searchable, sortable settlement records |
| `GET` | `/api/forecasts/export` | CSV download of filtered forecast and outturn dataset |
| `GET` | `/api/quality` | Interval coverage audit, missing observations, zero events |
| `GET` | `/api/bmrs/assets` | Raw WINDFOR stream and FUELHH 400 error diagnosis |
| `POST` | `/api/bmrs/diagnose` | Parameter conflict checker for Elexon BMRS API rules |
| `POST` | `/api/bmrs/fetch` | Live BMRS query with automatic parameter conflict stripping |
| `POST` | `/api/auth/login` | Trader & analyst authentication |
| `GET` | `/api/auth/me` | Current user profile |
| `POST` | `/api/dataset/switch`| Switch active mode (`january-2026` vs `assets-stream`) |

---

## 5. Resolving the Elexon BMRS RFC 9110 HTTP 400 Error

The provided `assets/Half-hourly generation outturn...json` file contains:
```json
{
  "status": 400,
  "errors": {
    "": ["The Settlement Date fields cannot be set when a Publish Date field is set."]
  }
}
```

### Backend Resolution
The `BMRSClient` and `/api/bmrs/diagnose` service detect this mutually exclusive condition:
1. When actual outturn data is queried for day-ahead settlement, only `settlementDateFrom` and `settlementDateTo` are passed, with `fuelType=WIND`.
2. Any `publishDateTimeFrom` or `publishDateTimeTo` parameters are automatically stripped to guarantee a successful HTTP 200 response from Elexon BMRS.

---

## 6. How to Run Locally

### Start Backend Service
```powershell
cd "f:\Wind Power Forecast Analysis Dashboard\Backend"
python run_server.py
```
The server will start at `http://127.0.0.1:8000`.  
Interactive Swagger API documentation: `http://127.0.0.1:8000/docs`.

### Run Test Suite
```powershell
python -m pytest tests/ -v
```
