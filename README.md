# WindInsight • Wind Power Forecast Analysis Dashboard

> **Full Stack Software Engineer Hiring Challenge — Frontend Review Phase**  
> **Client Context:** UK Electricity Utility  
> **Evaluation Period:** January 1–31, 2026  
> **Timezone:** Europe/London (GMT)

---

## 1. Project Overview

A specialized decision-support dashboard for a UK electricity utility. The utility purchases power 24–36 hours in advance in wholesale markets. When renewable wind generation deviates from forecasts, the utility must rapidly buy balance-power on the Balancing Mechanism or sell off surplus, frequently incurring costly imbalance cash-out prices.

### Key Objectives
1. **Forecast Visibility:** Display day-ahead wind generation forecasts relevant to purchase decisions across January 2026.
2. **Forecast Accuracy Analysis:** Compare forecasts against actual wind generation to quantify errors (MAE, RMSE, Signed Error / Bias).
3. **Data Quality & Integrity:** Maintain strict distinctions between genuine 0.0 MW calm generation, missing telemetry observations, and unmatched forecast records.
4. **Dual Data Ingestion:**
   - **January 2026 Benchmark:** 31 days, 1,488 half-hour settlement periods with synoptic weather patterns (storm ramps, high-pressure calm periods, and telemetry gaps).
   - **Original BMRS Asset Ingest:** Direct ingestion and diagnosis of raw Elexon BMRS stream responses located in `assets/` (`WINDFOR` 73 records and `FUELHH` HTTP 400 validation response).

---

## 2. Technology Stack

### Frontend (Implemented & Active)
- **Framework:** React 19 with Vite 8
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`) with custom energy-tech theme
- **Visualization:** Recharts 3 (dual time-series, signed/absolute error bars, daily MAE comparisons, error distribution histograms, diurnal profiles)
- **Icons:** Lucide React
- **Architecture:** Decoupled data service layer (`analyticsService.js`) ready for drop-in Python backend endpoints.

### Backend (Implemented & Active)
- **Framework:** Python 3.13.6 + FastAPI 0.115.0 (Asynchronous ASGI, OpenAPI 3.1)
- **Data Processing:** Pandas 2.3.3 + NumPy 2.1.1 (Vectorized statistical metric engine)
- **Testing:** Pytest 9.2.0 (16 automated unit & integration test suites)
- **Data Source:** Elexon BMRS API (`WINDFOR` and `FUELHH` endpoints) + Local Ingest & Diagnosis
- **Containerization:** Docker & Docker Compose
- **Server:** Uvicorn 0.30.5 on `http://127.0.0.1:8000`

---

## 3. Quick Start & Setup Instructions (Windows)

### Prerequisites
Verify that Python (v3.13) and Node.js (v20+ or v22+) are installed:
```powershell
python --version
node -v
npm -v
```

### 1. Running the Python FastAPI Backend
1. Navigate to the `Backend/` directory:
   ```powershell
   cd "f:\Wind Power Forecast Analysis Dashboard\Backend"
   ```
2. Run the test suite:
   ```powershell
   python -m pytest tests/ -v
   ```
3. Start the FastAPI server:
   ```powershell
   python run_server.py
   ```
   The backend service starts at `http://127.0.0.1:8000`.  
   Interactive OpenAPI / Swagger docs are available at `http://127.0.0.1:8000/docs`.

### 2. Running the Frontend
1. In a new terminal, navigate to the `frontend/` directory:
   ```powershell
   cd "f:\Wind Power Forecast Analysis Dashboard\frontend"
   ```
2. Install dependencies:
   ```powershell
   npm install
   ```
3. Start the Vite development server:
   ```powershell
   npm run dev
   ```
4. Open your browser and navigate to:
   ```
   http://127.0.0.1:5173/
   ```

### 3. Building for Production
```powershell
cd "f:\Wind Power Forecast Analysis Dashboard\frontend"
npm run build
```

---

## 4. Project File Structure

```
Wind Power Forecast Analysis Dashboard/
├── assets/                                  # Raw Elexon BMRS responses
│   ├── Wind generation forecast (WINDFOR) stream_response_1793111592799.json
│   └── Half-hourly generation outturn by fuel type (FUELHH) stream_response_1793113922664.json
├── frontend/                                # React + Vite Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── AppLayout.jsx            # Responsive shell with drawer & topbar
│   │   │   │   ├── Sidebar.jsx              # Navigation & pipeline metadata
│   │   │   │   └── Topbar.jsx               # Header, dataset switcher & UK clock
│   │   │   ├── dashboard/
│   │   │   │   ├── MetricCard.jsx           # KPI cards with units & explanations
│   │   │   │   ├── GenerationChart.jsx      # Recharts dual-line time series
│   │   │   │   ├── ForecastErrorChart.jsx   # Signed & absolute error bars
│   │   │   │   └── DataSummary.jsx          # Operational synthesis & extreme days
│   │   │   ├── tables/
│   │   │   │   ├── ForecastTable.jsx        # Sortable, searchable table with CSV export
│   │   │   │   └── ErrorTable.jsx           # Top 10 peak forecast discrepancies
│   │   │   └── common/
│   │   │       ├── DateRangeFilter.jsx      # Range presets & custom date inputs
│   │   │       ├── StatusBadge.jsx          # Audit status pill badges
│   │   │       ├── LoadingState.jsx         # Clean spinner state
│   │   │       ├── EmptyState.jsx           # Filter fallback state
│   │   │       └── ErrorState.jsx           # Error boundary state
│   │   ├── pages/
│   │   │   ├── Overview.jsx                 # Executive landing dashboard
│   │   │   ├── ForecastExplorer.jsx         # 30-min settlement period explorer
│   │   │   ├── AccuracyAnalysis.jsx         # MAE, RMSE, bias & diurnal profiles
│   │   │   ├── DataQuality.jsx              # Coverage audits & BMRS API inspector
│   │   │   └── AboutProject.jsx             # Business problem & architecture flow
│   │   ├── services/
│   │   │   └── analyticsService.js          # Abstracted data access interface
│   │   ├── data/
│   │   │   ├── mockWindData.js              # January 2026 dataset (1,488 SPs)
│   │   │   └── rawBMRSAssets.js             # Parsed assets/ stream responses
│   │   ├── utils/
│   │   │   ├── metrics.js                   # MAE, RMSE, Signed Error calculations
│   │   │   ├── dateUtils.js                 # UK settlement periods (1–48)
│   │   │   └── formatters.js                # MW, percentages & error formatters
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
├── Backend/                                 # Python 3.13 + FastAPI Backend
│   ├── app/
│   │   ├── main.py                          # FastAPI App & Routers
│   │   ├── core/config.py                   # Configuration & CORS
│   │   ├── models/schemas.py                # Pydantic v2 schemas
│   │   ├── data/
│   │   │   ├── benchmark_generator.py       # 1,488 SP Jan 2026 data generator
│   │   │   ├── asset_loader.py              # Ingests assets/ WINDFOR & FUELHH JSON
│   │   │   └── repository.py                # Pandas DataFrame repository & caching
│   │   ├── services/
│   │   │   ├── metrics_engine.py            # Vectorized MAE, RMSE, Bias engine
│   │   │   ├── data_quality.py              # Coverage & anomaly audits
│   │   │   └── bmrs_client.py               # Elexon BMRS API client & 400 fix
│   │   └── routers/                         # REST API Endpoints
│   ├── tests/                               # Pytest suite (16 test cases)
│   ├── Dockerfile                           # Container definition
│   ├── docker-compose.yml                   # Service orchestration
│   ├── requirements.txt                     # Pinned Python dependencies
│   ├── run_server.py                        # Uvicorn launcher script
│   └── README.md                            # Backend documentation
└── README.md
```

---

## 5. Mathematical Formulations & Accuracy Metrics

Let:
- $F_i$ = Day-ahead forecast wind generation in Megawatts (MW) for settlement interval $i$
- $A_i$ = Actual outturn wind generation in Megawatts (MW) for settlement interval $i$
- $n$ = Number of valid matched settlement intervals (where both $F_i$ and $A_i$ exist)

### 1. Signed Error ($e_i$)
$$e_i = F_i - A_i$$
* **$e_i > 0$ (Overforecast):** Contracted power exceeds generation; potential deficit on balancing mechanism.
* **$e_i < 0$ (Underforecast):** Actual generation exceeds forecast; potential surplus / spill.

### 2. Absolute Error ($AE_i$)
$$AE_i = |F_i - A_i|$$

### 3. Mean Absolute Error (MAE)
$$MAE = \frac{1}{n} \sum_{i=1}^{n} |F_i - A_i|$$
Measures standard linear average forecast magnitude deviation.

### 4. Root Mean Squared Error (RMSE)
$$RMSE = \sqrt{\frac{1}{n} \sum_{i=1}^{n} (F_i - A_i)^2}$$
Disproportionately penalizes large magnitude forecast errors (e.g. storm ramp delays).

### 5. Mean Signed Error (Systematic Bias)
$$Bias = \frac{1}{n} \sum_{i=1}^{n} (F_i - A_i)$$

> **Data Integrity Rule:** Missing actual observations ($A_i = \text{null}$) and unmatched records are strictly excluded from $n$ to avoid corrupting error totals. Genuine 0.0 MW events are preserved.

---

## 6. Day-Ahead Decision Cutoff Logic

In UK electricity trading (Elexon BSC):
1. Electricity auctions execute a day in advance before the delivery day.
2. Comparing an actual interval with a forecast published *after* the auction gate introduces lookahead bias.
3. For every 30-minute delivery interval, the system determines the applicable day-ahead cutoff (17:00 GMT on D-1) and selects the latest forecast published on or before that gate.

---

## 7. BMRS Assets Stream Ingest & Diagnostics

The application directly integrates the files provided in the `assets/` folder:
1. **`WINDFOR` Stream Response (`Wind generation forecast...json`):**
   - 73 records published at `2026-10-27T11:30:00Z` covering delivery from `2026-10-26T21:00Z` to `2026-10-29T21:00Z`.
   - Forecast values range between 5,197 MW and 22,525 MW.
2. **`FUELHH` Error Diagnosis (`Half-hourly generation outturn...json`):**
   - The file contains an RFC 9110 HTTP 400 error: `"The Settlement Date fields cannot be set when a Publish Date field is set."`
   - **Backend Resolution:** The Phase 2 FastAPI service will query FUELHH using only `settlementDateFrom` and `settlementDateTo` (omitting `publishDateTimeFrom`), cleanly pulling matching actuals.

---

## 8. Current Limitations & Scope Boundary

1. **Frontend-Only Phase:** The application currently runs in preview mode with client-side data adapters. Backend endpoints (`GET /api/forecasts`, `GET /api/analysis`) will be implemented upon review approval.
2. **Demand Data Scope:** MAE and RMSE quantify forecast accuracy. They do not directly compute the client utility's total power deficit because consumer demand profiles are not part of the BMRS datasets.

---

## 9. AI Tools Usage Disclosure

In compliance with the hiring challenge instructions, the following AI tools were utilized:
- **Google Antigravity IDE (Agentic Pair Programming):** Used as an engineering assistant for scaffolding modular React components, constructing synthetic UK settlement period generators, formatting Recharts visualizations, and drafting documentation.
- All mathematical formulas, Elexon BMRS settlement rules, and UI states were reviewed and verified for domain correctness.
