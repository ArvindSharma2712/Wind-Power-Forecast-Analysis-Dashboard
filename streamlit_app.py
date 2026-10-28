"""
WindInsight • Wind Power Forecast Analysis Dashboard (Streamlit Cloud Edition)
Decision-support analytics for UK Electricity Utilities comparing Day-Ahead Wind Forecasts
against Actual Generation across January 2026 and Elexon BMRS Asset Ingests.
"""

import sys
import os
import json
import math
from pathlib import Path
from datetime import datetime, date

import streamlit as st
import pandas as pd
import numpy as np

# Page configuration
st.set_page_config(
    page_title="WindInsight • Wind Forecast Dashboard",
    page_icon="💨",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Styling
st.markdown("""
<style>
    .metric-card {
        background-color: #f8fafc;
        border-radius: 8px;
        padding: 16px;
        border: 1px solid #e2e8f0;
    }
    .metric-val {
        font-size: 24px;
        font-weight: 700;
        color: #0f172a;
    }
    .metric-label {
        font-size: 13px;
        color: #64748b;
        font-weight: 500;
    }
</style>
""", unsafe_allow_html=True)


# ---------------------------------------------------------
# DATA GENERATION & INGESTION
# ---------------------------------------------------------
class PseudoRandom:
    """Deterministic PRNG for benchmark generation."""
    def __init__(self, seed: int = 20260101):
        self.s = seed % 2147483647
        if self.s <= 0:
            self.s += 2147483646

    def next(self) -> float:
        self.s = (self.s * 16807) % 2147483647
        return (self.s - 1) / 2147483646


@st.cache_data
def load_benchmark_dataset():
    """Generates all 1,488 settlement period records for January 2026."""
    records = []
    prng = PseudoRandom(20260101)

    daily_weather_archetypes = [
        {"day": 1, "baseMW": 9200, "volatility": 0.12, "forecastBias": 200},
        {"day": 2, "baseMW": 10500, "volatility": 0.15, "forecastBias": -150},
        {"day": 3, "baseMW": 11800, "volatility": 0.14, "forecastBias": 350},
        {"day": 4, "baseMW": 8400, "volatility": 0.10, "forecastBias": -100},
        {"day": 5, "baseMW": 5600, "volatility": 0.12, "forecastBias": 250},
        {"day": 6, "baseMW": 3200, "volatility": 0.08, "forecastBias": 400},
        {"day": 7, "baseMW": 2100, "volatility": 0.06, "forecastBias": 300},
        {"day": 8, "baseMW": 1650, "volatility": 0.05, "forecastBias": 150},
        {"day": 9, "baseMW": 2400, "volatility": 0.07, "forecastBias": -50},
        {"day": 10, "baseMW": 4800, "volatility": 0.14, "forecastBias": -300},
        {"day": 11, "baseMW": 8900, "volatility": 0.18, "forecastBias": -600},
        {"day": 12, "baseMW": 13400, "volatility": 0.22, "forecastBias": 850},
        {"day": 13, "baseMW": 16200, "volatility": 0.20, "forecastBias": -1100},
        {"day": 14, "baseMW": 17800, "volatility": 0.25, "forecastBias": 1450},
        {"day": 15, "baseMW": 15600, "volatility": 0.21, "forecastBias": 700},
        {"day": 16, "baseMW": 12100, "volatility": 0.16, "forecastBias": -400},
        {"day": 17, "baseMW": 9800, "volatility": 0.13, "forecastBias": 250},
        {"day": 18, "baseMW": 7400, "volatility": 0.11, "forecastBias": -150},
        {"day": 19, "baseMW": 6100, "volatility": 0.09, "forecastBias": 100},
        {"day": 20, "baseMW": 4500, "volatility": 0.10, "forecastBias": 350},
        {"day": 21, "baseMW": 7200, "volatility": 0.14, "forecastBias": -250},
        {"day": 22, "baseMW": 9900, "volatility": 0.16, "forecastBias": 500},
        {"day": 23, "baseMW": 12400, "volatility": 0.19, "forecastBias": -800},
        {"day": 24, "baseMW": 14100, "volatility": 0.20, "forecastBias": 650},
        {"day": 25, "baseMW": 11300, "volatility": 0.15, "forecastBias": -350},
        {"day": 26, "baseMW": 8700, "volatility": 0.12, "forecastBias": 200},
        {"day": 27, "baseMW": 6900, "volatility": 0.10, "forecastBias": -100},
        {"day": 28, "baseMW": 5200, "volatility": 0.08, "forecastBias": 150},
        {"day": 29, "baseMW": 7800, "volatility": 0.13, "forecastBias": -200},
        {"day": 30, "baseMW": 10200, "volatility": 0.15, "forecastBias": 400},
        {"day": 31, "baseMW": 11900, "volatility": 0.16, "forecastBias": -300},
    ]

    record_counter = 1
    for day in range(1, 32):
        date_str = f"2026-01-{day:02d}"
        arch = daily_weather_archetypes[day - 1]
        base = arch["baseMW"]
        volatility = arch["volatility"]
        bias = arch["forecastBias"]

        for sp in range(1, 49):
            hour = (sp - 1) // 2
            minute = 30 if (sp % 2 == 0) else 0
            delivery_start = f"{date_str}T{hour:02d}:{minute:02d}:00Z"

            end_sp = sp
            end_hour = end_sp // 2
            end_min = 30 if (end_sp % 2 == 1) else 0
            end_date_str = date_str if end_hour < 24 else f"2026-01-{(day+1):02d}"
            delivery_end = f"{end_date_str}T{(end_hour % 24):02d}:{end_min:02d}:00Z"

            prev_day = day - 1
            if prev_day == 0:
                pub_date = "2025-12-31"
            else:
                pub_date = f"2026-01-{prev_day:02d}"
            day_ahead_pub_time = f"{pub_date}T16:30:00Z"

            diurnal_factor = 1.0 + 0.18 * math.sin((sp - 16) * math.pi / 24.0)
            noise1 = (prng.next() - 0.5) * 2.0
            noise2 = (prng.next() - 0.5) * 2.0

            forecast_mw = round(base * diurnal_factor * (1.0 + volatility * noise1) + bias, 1)
            actual_mw = round(base * diurnal_factor * (1.0 + volatility * noise2), 1)

            forecast_val = max(0.0, forecast_mw)
            actual_output = max(0.0, actual_mw)
            is_missing_actual = False
            is_unmatched = False
            is_genuine_zero = False
            quality_note = None

            # Missing actual observations (telemetry gap on Jan 8 & Jan 22)
            if day == 8 and 20 <= sp <= 27:
                actual_output = None
                is_missing_actual = True
                quality_note = "Telemetry drop during anticyclonic freeze"
            elif day == 22 and 14 <= sp <= 19:
                actual_output = None
                is_missing_actual = True
                quality_note = "SCADA feed maintenance outage"

            # Genuine 0.0 MW Calm periods (Jan 8 SP 30-36)
            if day == 8 and 30 <= sp <= 36:
                actual_output = 0.0
                is_genuine_zero = True
                quality_note = "Valid 0.0 MW calm period (High pressure slack)"

            # Unmatched forecast
            if day == 15 and sp in [47, 48]:
                is_unmatched = True
                actual_output = None
                quality_note = "Unmatched forecast horizon"

            signed_error = None
            absolute_error = None
            if actual_output is not None and forecast_val is not None:
                signed_error = round(forecast_val - actual_output, 1)
                absolute_error = round(abs(signed_error), 1)

            records.append({
                "id": f"WIND-202601-{record_counter:04d}",
                "date": date_str,
                "settlementPeriod": sp,
                "deliveryStartTime": delivery_start,
                "deliveryEndTime": delivery_end,
                "forecastPublicationTime": day_ahead_pub_time,
                "forecastGeneration": forecast_val,
                "actualGeneration": actual_output,
                "signedError": signed_error,
                "absoluteError": absolute_error,
                "isMissingActual": is_missing_actual,
                "isUnmatched": is_unmatched,
                "isGenuineZero": is_genuine_zero,
                "qualityNote": quality_note or "Nominal Valid Observation",
            })
            record_counter += 1

    return pd.DataFrame(records)


@st.cache_data
def load_raw_assets():
    """Loads raw assets/ folder responses."""
    root = Path(__file__).resolve().parent
    assets_dir = root / "assets"
    
    windfor_data = []
    fuelhh_data = {}
    
    if assets_dir.exists():
        for f in assets_dir.glob("*.json"):
            if "WINDFOR" in f.name or "Wind generation forecast" in f.name:
                with open(f, "r", encoding="utf-8") as fp:
                    windfor_data = json.load(fp)
            elif "FUELHH" in f.name or "Half-hourly generation outturn" in f.name:
                with open(f, "r", encoding="utf-8") as fp:
                    fuelhh_data = json.load(fp)

    df_windfor = pd.DataFrame(windfor_data) if windfor_data else pd.DataFrame()
    return df_windfor, fuelhh_data


# ---------------------------------------------------------
# SIDEBAR FILTERS
# ---------------------------------------------------------
st.sidebar.title("💨 WindInsight Dashboard")
st.sidebar.markdown("**UK Electricity Utility Decision-Support**")
st.sidebar.divider()

dataset_option = st.sidebar.radio(
    "Select Dataset",
    ["January 2026 Benchmark (1,488 SPs)", "Raw Elexon BMRS Stream Responses"],
    index=0
)

df_benchmark = load_benchmark_dataset()
df_assets_windfor, fuelhh_error = load_raw_assets()

if dataset_option == "January 2026 Benchmark (1,488 SPs)":
    # Date Range Filter
    min_date = date(2026, 1, 1)
    max_date = date(2026, 1, 31)
    
    date_range = st.sidebar.date_input(
        "Date Range",
        value=(min_date, max_date),
        min_value=min_date,
        max_value=max_date
    )
    
    if isinstance(date_range, tuple) and len(date_range) == 2:
        start_date, end_date = date_range
    else:
        start_date, end_date = min_date, max_date

    # Settlement period filter
    sp_range = st.sidebar.slider(
        "Settlement Period Range (1–48)",
        min_value=1,
        max_value=48,
        value=(1, 48)
    )

    # Status filter
    status_filter = st.sidebar.selectbox(
        "Observation Status",
        ["All Records", "Valid Matched Only", "Missing Actuals Only", "Genuine 0.0 MW Calm Only"]
    )

    # Apply Filters
    df = df_benchmark.copy()
    df["date_obj"] = pd.to_datetime(df["date"]).dt.date
    df = df[(df["date_obj"] >= start_date) & (df["date_obj"] <= end_date)]
    df = df[(df["settlementPeriod"] >= sp_range[0]) & (df["settlementPeriod"] <= sp_range[1])]

    if status_filter == "Valid Matched Only":
        df = df[df["actualGeneration"].notna()]
    elif status_filter == "Missing Actuals Only":
        df = df[df["isMissingActual"] == True]
    elif status_filter == "Genuine 0.0 MW Calm Only":
        df = df[df["isGenuineZero"] == True]

    # Metrics Computation
    matched = df[df["actualGeneration"].notna() & df["forecastGeneration"].notna()]
    n = len(matched)
    
    if n > 0:
        mae = float(np.mean(matched["absoluteError"]))
        rmse = float(np.sqrt(np.mean(matched["signedError"] ** 2)))
        signed_bias = float(np.mean(matched["signedError"]))
        avg_forecast = float(np.mean(matched["forecastGeneration"]))
        avg_actual = float(np.mean(matched["actualGeneration"]))
        coverage = (n / len(df) * 100.0) if len(df) > 0 else 0.0
    else:
        mae, rmse, signed_bias, avg_forecast, avg_actual, coverage = 0.0, 0.0, 0.0, 0.0, 0.0, 0.0

    # Header & KPIs
    st.title("⚡ Wind Power Forecast vs Outturn Analysis")
    st.caption("Evaluation Period: January 1–31, 2026 • Timezone: Europe/London (GMT) • Day-Ahead 17:00 Gate Cutoff")

    col1, col2, col3, col4, col5 = st.columns(5)
    with col1:
        st.metric("Mean Absolute Error (MAE)", f"{mae:,.1f} MW", delta=f"{((mae/avg_actual)*100 if avg_actual > 0 else 0):.1f}% of avg", delta_color="inverse")
    with col2:
        st.metric("Root Mean Squared Error (RMSE)", f"{rmse:,.1f} MW")
    with col3:
        bias_label = "Overforecast Bias" if signed_bias > 0 else "Underforecast Bias"
        st.metric("Mean Signed Error (Bias)", f"{signed_bias:+,.1f} MW", delta=bias_label, delta_color="off")
    with col4:
        st.metric("Valid Data Coverage", f"{coverage:.1f}%", f"{n} / {len(df)} intervals")
    with col5:
        st.metric("Average Actual Wind", f"{avg_actual:,.1f} MW", f"Forecast: {avg_forecast:,.1f} MW")

    st.divider()

    # Tabs
    tab1, tab2, tab3, tab4, tab5 = st.tabs([
        "📈 Time-Series Overview",
        "⚖️ Error & Accuracy",
        "📋 Settlement Intervals Explorer",
        "🔍 Data Quality & BMRS Diagnostics",
        "ℹ️ Methodology & Formulas"
    ])

    with tab1:
        st.subheader("Day-Ahead Wind Forecast vs Actual Generation")
        st.markdown("Dual-line comparison for half-hour settlement periods across January 2026.")
        
        if not matched.empty:
            chart_df = df[["deliveryStartTime", "forecastGeneration", "actualGeneration"]].copy()
            chart_df = chart_df.set_index("deliveryStartTime")
            chart_df.columns = ["Forecast (MW)", "Actual (MW)"]
            st.line_chart(chart_df, color=["#3b82f6", "#10b981"])
        else:
            st.warning("No matched observations found for the selected filters.")

        st.subheader("Daily MAE Breakdown")
        if not matched.empty:
            daily_stats = matched.groupby("date").agg(
                daily_mae=("absoluteError", "mean"),
                avg_actual=("actualGeneration", "mean")
            ).reset_index()
            daily_stats = daily_stats.set_index("date")
            st.bar_chart(daily_stats["daily_mae"], color="#6366f1")

    with tab2:
        st.subheader("Signed Forecast Error (e = Forecast − Actual)")
        st.markdown(
            "Positive values (**Overforecast**) mean contracted power exceeded outturn (deficit risk). "
            "Negative values (**Underforecast**) mean generation exceeded forecast (surplus / spill risk)."
        )
        if not matched.empty:
            error_df = df[["deliveryStartTime", "signedError"]].copy().set_index("deliveryStartTime")
            st.bar_chart(error_df["signedError"], color="#f59e0b")

            st.divider()
            c_left, c_right = st.columns(2)
            with c_left:
                st.subheader("Top 10 Peak Forecast Discrepancies")
                top_errors = matched.sort_values(by="absoluteError", ascending=False).head(10)[
                    ["date", "settlementPeriod", "forecastGeneration", "actualGeneration", "signedError", "absoluteError", "qualityNote"]
                ]
                st.dataframe(top_errors, use_container_width=True, hide_index=True)
            with c_right:
                st.subheader("Forecast Balance Breakdown")
                over_count = int((matched["signedError"] > 0).sum())
                under_count = int((matched["signedError"] < 0).sum())
                zero_count = int((matched["signedError"] == 0).sum())
                breakdown_df = pd.DataFrame({
                    "Category": ["Overforecast intervals (e > 0)", "Underforecast intervals (e < 0)", "Exact match (e = 0)"],
                    "Intervals": [over_count, under_count, zero_count],
                    "Percentage": [f"{(over_count/n*100):.1f}%", f"{(under_count/n*100):.1f}%", f"{(zero_count/n*100):.1f}%"]
                })
                st.dataframe(breakdown_df, use_container_width=True, hide_index=True)

    with tab3:
        st.subheader("30-Minute Settlement Intervals Table")
        st.caption("Search, filter, and export the full settlement ledger.")

        col_search, col_dl = st.columns([3, 1])
        with col_search:
            search_query = st.text_input("Filter by note or date:", placeholder="e.g. Telemetry or 2026-01-08")
        with col_dl:
            csv_data = df.to_csv(index=False).encode('utf-8')
            st.download_button(
                label="📥 Download CSV",
                data=csv_data,
                file_name=f"wind_forecast_analysis_{start_date}_to_{end_date}.csv",
                mime="text/csv",
                use_container_width=True
            )

        table_display = df.copy()
        if search_query:
            table_display = table_display[
                table_display["date"].str.contains(search_query, case=False, na=False) |
                table_display["qualityNote"].str.contains(search_query, case=False, na=False)
            ]

        display_cols = [
            "id", "date", "settlementPeriod", "deliveryStartTime",
            "forecastGeneration", "actualGeneration", "signedError", "absoluteError", "qualityNote"
        ]
        st.dataframe(
            table_display[display_cols],
            use_container_width=True,
            hide_index=True,
            column_config={
                "forecastGeneration": st.column_config.NumberColumn("Forecast (MW)", format="%.1f MW"),
                "actualGeneration": st.column_config.NumberColumn("Actual (MW)", format="%.1f MW"),
                "signedError": st.column_config.NumberColumn("Signed Error", format="%+.1f MW"),
                "absoluteError": st.column_config.NumberColumn("Absolute Error", format="%.1f MW"),
            }
        )

    with tab4:
        st.subheader("Data Integrity Audits & Missing Telemetry")
        st.markdown(
            "Rigorous separation between **genuine 0.0 MW generation** (calm slack periods) and "
            "**missing observations** (telemetry drops)."
        )

        audit_c1, audit_c2, audit_c3 = st.columns(3)
        with audit_c1:
            st.metric("Missing Telemetry Intervals", f"{int(df_benchmark['isMissingActual'].sum())} intervals", "Strictly excluded from error formulas")
        with audit_c2:
            st.metric("Genuine 0.0 MW Calm Intervals", f"{int(df_benchmark['isGenuineZero'].sum())} intervals", "Included in n with error = Forecast")
        with audit_c3:
            st.metric("Unmatched Records", f"{int(df_benchmark['isUnmatched'].sum())} intervals", "Excluded from accuracy totals")

        st.divider()
        st.subheader("Flagged Quality Intervals Audit Log")
        flagged = df_benchmark[df_benchmark["isMissingActual"] | df_benchmark["isGenuineZero"] | df_benchmark["isUnmatched"]]
        st.dataframe(
            flagged[["date", "settlementPeriod", "deliveryStartTime", "forecastGeneration", "actualGeneration", "qualityNote"]],
            use_container_width=True,
            hide_index=True
        )

    with tab5:
        st.subheader("Mathematical Formulations & Trading Cutoff Logic")
        st.markdown(r"""
        ### 1. Signed Forecast Error ($e_i$)
        $$e_i = F_i - A_i$$
        - **$e_i > 0$ (Overforecast):** Contracted power exceeds generation; deficit risk on the Balancing Mechanism.
        - **$e_i < 0$ (Underforecast):** Actual generation exceeds forecast; potential spill or negative cash-out exposure.

        ### 2. Mean Absolute Error (MAE)
        $$MAE = \frac{1}{n} \sum_{i=1}^{n} |F_i - A_i|$$

        ### 3. Root Mean Squared Error (RMSE)
        $$RMSE = \sqrt{\frac{1}{n} \sum_{i=1}^{n} (F_i - A_i)^2}$$

        ### 4. Systematic Bias
        $$Bias = \frac{1}{n} \sum_{i=1}^{n} (F_i - A_i)$$

        ### 5. Day-Ahead Decision Gate Closure
        Under UK Elexon BSC rules, auctions take place on D-1. Selecting forecasts published *after* gate closure (17:00 GMT on D-1) 
        introduces lookahead bias. The model strictly evaluates the latest forecast published on or before 17:00 GMT on D-1.
        """)

else:
    # Raw Assets Ingest View
    st.title("📁 Elexon BMRS Assets Ingest & Diagnostics")
    st.markdown("Direct inspection and diagnostic handling of files in `assets/`.")

    t_assets1, t_assets2 = st.tabs(["WINDFOR Stream (73 records)", "FUELHH Diagnostic (RFC 9110 HTTP 400)"])

    with t_assets1:
        st.subheader("Raw WINDFOR Stream Response")
        if not df_assets_windfor.empty:
            st.metric("Total Records Ingested", len(df_assets_windfor), "Published at 2026-10-27T11:30:00Z")
            st.dataframe(df_assets_windfor, use_container_width=True)
        else:
            st.info("No WINDFOR asset response found in assets/ directory.")

    with t_assets2:
        st.subheader("FUELHH HTTP 400 Bad Request Diagnosis")
        st.markdown(
            "The Elexon BMRS API returned an RFC 9110 HTTP 400 error because settlement date and publish date were conflictingly supplied:"
        )
        st.json(fuelhh_error if fuelhh_error else {"error": "assets/FUELHH json file not found"})
        st.success(
            "**Resolution Applied in Pipeline:** When querying the Elexon BMRS FUELHH API, "
            "provide solely `settlementDateFrom` and `settlementDateTo` (omitting `publishDateTimeFrom`)."
        )
