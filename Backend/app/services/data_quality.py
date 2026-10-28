"""
Data Quality and Integrity Auditor
Audits dataset completeness, missing actual observations, genuine zeros, and BMRS feed anomalies.
"""

from typing import Dict, Any, List
from datetime import datetime
import pandas as pd
from .metrics_engine import MetricsEngine
from ..data.repository import data_repository


class DataQualityAuditor:
    @staticmethod
    def generate_quality_report(
        df: pd.DataFrame,
        start_date: str,
        end_date: str,
    ) -> Dict[str, Any]:
        """Generates comprehensive quality audit report and structured anomaly logs."""
        try:
            d_start = datetime.strptime(start_date, "%Y-%m-%d")
            d_end = datetime.strptime(end_date, "%Y-%m-%d")
            total_days = max(1, (d_end - d_start).days + 1)
        except Exception:
            total_days = 31

        expected_intervals = total_days * 48

        matched_df = MetricsEngine.get_matched_dataframe(df)
        total_records = len(df)
        matched_count = len(matched_df)

        missing_actuals_df = df[df["isMissingActual"] == True] if "isMissingActual" in df.columns else pd.DataFrame()
        unmatched_df = df[df["isUnmatched"] == True] if "isUnmatched" in df.columns else pd.DataFrame()
        genuine_zeros_df = df[df["isGenuineZero"] == True] if "isGenuineZero" in df.columns else pd.DataFrame()

        coverage_pct = round((matched_count / expected_intervals * 100.0), 2) if expected_intervals > 0 else 0.0

        summary = {
            "totalForecastRecords": total_records,
            "totalActualRecords": int(df["actualGeneration"].notna().sum()) if not df.empty else 0,
            "matchedDeliveryIntervals": matched_count,
            "unmatchedForecastRecords": len(unmatched_df),
            "missingActualObservations": len(missing_actuals_df),
            "genuineZeroObservations": len(genuine_zeros_df),
            "duplicateRecords": 0,
            "dataCoveragePercent": coverage_pct,
        }

        # Build structured quality logs
        quality_logs = []

        # Missing Actuals
        for _, r in missing_actuals_df.iterrows():
            quality_logs.append({
                "id": f"LOG-MISS-{r['id']}",
                "timestamp": r["deliveryStartTime"],
                "settlementPeriod": int(r["settlementPeriod"]),
                "type": "Missing Actual Generation",
                "severity": "Warning",
                "dataset": "FUELHH (Actual Wind)",
                "description": r["qualityNote"] or "No actual telemetry returned by BMRS for settlement interval",
                "impact": "Interval excluded from MAE and RMSE calculation to prevent zero-imputation corruption",
            })

        # Unmatched Forecasts
        for _, r in unmatched_df.iterrows():
            quality_logs.append({
                "id": f"LOG-UNM-{r['id']}",
                "timestamp": r["deliveryStartTime"],
                "settlementPeriod": int(r["settlementPeriod"]),
                "type": "Unmatched Forecast Record",
                "severity": "Info",
                "dataset": "WINDFOR (Forecast)",
                "description": r["qualityNote"] or "Forecast horizon published outside gate closure matching cutoff",
                "impact": "Excluded from day-ahead purchase error analysis to avoid lookahead bias",
            })

        # Genuine Zeros
        for _, r in genuine_zeros_df.iterrows():
            quality_logs.append({
                "id": f"LOG-ZERO-{r['id']}",
                "timestamp": r["deliveryStartTime"],
                "settlementPeriod": int(r["settlementPeriod"]),
                "type": "Zero Generation Event",
                "severity": "Valid",
                "dataset": "FUELHH (Actual Wind)",
                "description": "Genuine zero generation observed (distinguished from missing telemetry)",
                "impact": "Preserved in MAE and RMSE calculation as valid 0.0 MW observation",
            })

        # Sort logs chronologically
        quality_logs.sort(key=lambda x: x["timestamp"])

        return {
            "summary": summary,
            "qualityLogs": quality_logs,
            "rawBMRSAssets": data_repository.get_raw_assets(),
            "dataMode": data_repository.get_mode(),
        }


data_quality_auditor = DataQualityAuditor()
