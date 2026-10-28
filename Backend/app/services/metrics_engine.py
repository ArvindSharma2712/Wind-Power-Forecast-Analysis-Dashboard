"""
High-Performance Mathematical & Vectorized Metrics Engine
Implements UK Electricity Utility Forecast Accuracy Formulations using Pandas & NumPy.

Mathematical Specifications:
1. Signed Error: e_i = F_i - A_i
   (e_i > 0: Overforecasting / surplus purchase risk; e_i < 0: Underforecasting / deficit risk)
2. Absolute Error: AE_i = |F_i - A_i|
3. Mean Absolute Error: MAE = (1/n) * sum(|F_i - A_i|)
4. Root Mean Squared Error: RMSE = sqrt((1/n) * sum((F_i - A_i)^2))
5. Mean Signed Error (Systematic Bias): Bias = (1/n) * sum(F_i - A_i)
6. Data Integrity Rule: Missing actual observations (null / NaN) and unmatched records
   are strictly excluded from n. Genuine 0.0 MW generation events are preserved in n.
"""

from typing import List, Dict, Any, Optional, Tuple
import math
import numpy as np
import pandas as pd


class MetricsEngine:
    @staticmethod
    def get_matched_dataframe(df: pd.DataFrame) -> pd.DataFrame:
        """Returns filtered DataFrame containing only matched intervals (both F and A present)."""
        if df.empty:
            return df
        return df[
            df["forecastGeneration"].notna() &
            df["actualGeneration"].notna()
        ].copy()

    @staticmethod
    def compute_overall_metrics(df: pd.DataFrame, expected_intervals: Optional[int] = None) -> Dict[str, Any]:
        """Vectorized computation of overall evaluation metrics."""
        total_records = len(df)
        expected = expected_intervals or total_records or 1
        matched_df = MetricsEngine.get_matched_dataframe(df)
        n = len(matched_df)

        unmatched_count = int(df["isUnmatched"].sum()) if not df.empty and "isUnmatched" in df.columns else 0
        missing_count = int(df["isMissingActual"].sum()) if not df.empty and "isMissingActual" in df.columns else 0
        genuine_zero_count = int(df["isGenuineZero"].sum()) if not df.empty and "isGenuineZero" in df.columns else 0

        if n == 0:
            return {
                "n": 0,
                "totalRecords": total_records,
                "expectedIntervals": expected,
                "coveragePercent": 0.0,
                "avgForecastMW": 0.0,
                "avgActualMW": 0.0,
                "mae": 0.0,
                "rmse": 0.0,
                "meanSignedError": 0.0,
                "maxAbsoluteError": 0.0,
                "maxOverforecastMW": 0.0,
                "maxUnderforecastMW": 0.0,
                "normalizedMaePercent": 0.0,
                "biasDirection": "neutral",
                "unmatchedCount": unmatched_count,
                "missingActualCount": missing_count,
                "genuineZeroCount": genuine_zero_count,
            }

        f = matched_df["forecastGeneration"].to_numpy(dtype=float)
        a = matched_df["actualGeneration"].to_numpy(dtype=float)

        signed_errors = f - a
        abs_errors = np.abs(signed_errors)
        squared_errors = signed_errors ** 2

        avg_forecast = float(np.mean(f))
        avg_actual = float(np.mean(a))
        mae = float(np.mean(abs_errors))
        rmse = float(np.sqrt(np.mean(squared_errors)))
        mean_signed_error = float(np.mean(signed_errors))
        max_abs_error = float(np.max(abs_errors))

        # Max overforecast (> 0) and max underforecast (< 0)
        overforecasts = signed_errors[signed_errors > 0]
        underforecasts = signed_errors[signed_errors < 0]
        max_overforecast = float(np.max(overforecasts)) if len(overforecasts) > 0 else 0.0
        max_underforecast = float(np.min(underforecasts)) if len(underforecasts) > 0 else 0.0

        normalized_mae = (mae / avg_actual * 100.0) if avg_actual > 0 else 0.0

        if mean_signed_error > 25.0:
            bias_direction = "overforecasting"
        elif mean_signed_error < -25.0:
            bias_direction = "underforecasting"
        else:
            bias_direction = "neutral"

        coverage_percent = (n / expected * 100.0) if expected > 0 else 0.0

        return {
            "n": n,
            "totalMatchedIntervals": n,
            "totalRecords": total_records,
            "expectedIntervals": expected,
            "coveragePercent": round(coverage_percent, 2),
            "avgForecastMW": round(avg_forecast, 1),
            "avgActualMW": round(avg_actual, 1),
            "mae": round(mae, 1),
            "rmse": round(rmse, 1),
            "meanSignedError": round(mean_signed_error, 1),
            "maxAbsoluteError": round(max_abs_error, 1),
            "maxOverforecastMW": round(max_overforecast, 1),
            "maxUnderforecastMW": round(max_underforecast, 1),
            "normalizedMaePercent": round(normalized_mae, 2),
            "biasDirection": bias_direction,
            "unmatchedCount": unmatched_count,
            "missingActualCount": missing_count,
            "genuineZeroCount": genuine_zero_count,
        }

    @staticmethod
    def compute_daily_metrics(df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Vectorized aggregation of records by calendar date."""
        if df.empty:
            return []

        daily_list = []
        for date_str, group in df.groupby("dateString", sort=True):
            metrics = MetricsEngine.compute_overall_metrics(group, expected_intervals=48)
            day_num = int(date_str[8:10]) if len(date_str) >= 10 else 1

            matched_df = MetricsEngine.get_matched_dataframe(group)
            if not matched_df.empty:
                s_errors = (matched_df["forecastGeneration"] - matched_df["actualGeneration"]).to_numpy(dtype=float)
                max_s = float(np.max(s_errors))
                min_s = float(np.min(s_errors))
            else:
                max_s = 0.0
                min_s = 0.0

            daily_list.append({
                "date": date_str,
                "settlementDay": day_num,
                "mae": metrics["mae"],
                "rmse": metrics["rmse"],
                "meanSignedError": metrics["meanSignedError"],
                "maxSignedError": round(max_s, 1),
                "minSignedError": round(min_s, 1),
                "matchedIntervals": metrics["n"],
                "missingIntervals": int(group["isMissingActual"].sum()) if "isMissingActual" in group.columns else 0,
                "coveragePercent": metrics["coveragePercent"],
                "avgForecastMW": metrics["avgForecastMW"],
                "avgActualMW": metrics["avgActualMW"],
                "isHighErrorDay": metrics["mae"] is not None and metrics["mae"] > 1000.0,
            })

        return daily_list

    @staticmethod
    def find_best_and_worst_days(daily_metrics: List[Dict[str, Any]]) -> Tuple[Optional[Dict[str, Any]], Optional[Dict[str, Any]]]:
        """Identifies best (lowest MAE) and worst (highest MAE) days among those with >= 24 matched intervals."""
        qualified = [d for d in daily_metrics if d["matchedIntervals"] >= 24 and d["mae"] is not None]
        if not qualified:
            return None, None

        best_day = min(qualified, key=lambda d: d["mae"])
        worst_day = max(qualified, key=lambda d: d["mae"])
        return best_day, worst_day

    @staticmethod
    def compute_error_distribution(df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Computes error histogram distribution across predefined MW bins."""
        matched_df = MetricsEngine.get_matched_dataframe(df)
        total = len(matched_df)

        bins_def = [
            {"bin": "< -3000", "rangeMin": -float("inf"), "rangeMax": -3000.0},
            {"bin": "-3000 to -2000", "rangeMin": -3000.0, "rangeMax": -2000.0},
            {"bin": "-2000 to -1000", "rangeMin": -2000.0, "rangeMax": -1000.0},
            {"bin": "-1000 to 0", "rangeMin": -1000.0, "rangeMax": 0.0},
            {"bin": "0 to +1000", "rangeMin": 0.0, "rangeMax": 1000.0},
            {"bin": "+1000 to +2000", "rangeMin": 1000.0, "rangeMax": 2000.0},
            {"bin": "+2000 to +3000", "rangeMin": 2000.0, "rangeMax": 3000.0},
            {"bin": "> +3000", "rangeMin": 3000.0, "rangeMax": float("inf")},
        ]

        if total == 0:
            return [
                {**b, "count": 0, "percentage": 0.0, "rangeMin": -9999.0 if math.isinf(b["rangeMin"]) else b["rangeMin"], "rangeMax": 9999.0 if math.isinf(b["rangeMax"]) else b["rangeMax"]}
                for b in bins_def
            ]

        errors = (matched_df["forecastGeneration"] - matched_df["actualGeneration"]).to_numpy(dtype=float)
        result = []

        for b in bins_def:
            is_neg_inf = math.isinf(b["rangeMin"]) and b["rangeMin"] < 0
            is_pos_inf = math.isinf(b["rangeMax"]) and b["rangeMax"] > 0

            if is_neg_inf:
                mask = errors < b["rangeMax"]
            elif is_pos_inf:
                mask = errors >= b["rangeMin"]
            else:
                mask = (errors >= b["rangeMin"]) & (errors < b["rangeMax"])

            cnt = int(np.sum(mask))
            pct = round((cnt / total * 100.0), 2)

            min_val = -9999.0 if is_neg_inf else b["rangeMin"]
            max_val = 9999.0 if is_pos_inf else b["rangeMax"]

            result.append({
                "bin": b["bin"],
                "count": cnt,
                "percentage": pct,
                "rangeMin": min_val,
                "rangeMax": max_val,
            })

        return result

    @staticmethod
    def compute_diurnal_profile(df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Vectorized diurnal profile across all 48 UK settlement periods."""
        profile = []

        for sp in range(1, 49):
            start_mins = (sp - 1) * 30
            h = f"{start_mins // 60:02d}"
            m = f"{start_mins % 60:02d}"
            label = f"{h}:{m}"

            sp_group = df[df["settlementPeriod"] == sp] if not df.empty else pd.DataFrame()
            metrics = MetricsEngine.compute_overall_metrics(sp_group)

            profile.append({
                "settlementPeriod": sp,
                "hourLabel": label,
                "avgForecastMW": metrics["avgForecastMW"],
                "avgActualMW": metrics["avgActualMW"],
                "mae": metrics["mae"],
                "meanSignedError": metrics["meanSignedError"],
                "sampleCount": metrics["n"],
            })

        return profile

    @staticmethod
    def compute_timeseries(df: pd.DataFrame, aggregation: str = "30min") -> List[Dict[str, Any]]:
        """Transforms and aggregates time-series data for Recharts visualization."""
        if df.empty:
            return []

        if aggregation == "30min":
            records = df.to_dict(orient="records")
            return [
                {
                    "timestamp": r["deliveryStartTime"],
                    "dateString": r["dateString"],
                    "settlementPeriod": r["settlementPeriod"],
                    "label": f"{r['dateString'][5:]} SP{r['settlementPeriod']}",
                    "forecast": None if pd.isna(r.get("forecastGeneration")) else r["forecastGeneration"],
                    "actual": None if pd.isna(r.get("actualGeneration")) else r["actualGeneration"],
                    "signedError": None if pd.isna(r.get("signedError")) else r["signedError"],
                    "absoluteError": None if pd.isna(r.get("absoluteError")) else r["absoluteError"],
                    "isMissingActual": bool(r.get("isMissingActual", False)),
                    "isGenuineZero": bool(r.get("isGenuineZero", False)),
                    "isUnmatched": bool(r.get("isUnmatched", False)),
                }
                for r in records
            ]

        if aggregation == "hourly":
            hourly_buckets = {}
            for _, r in df.iterrows():
                sp = int(r["settlementPeriod"])
                hour = (sp - 1) // 2
                hour_key = f"{r['dateString']}T{hour:02d}:00:00Z"

                if hour_key not in hourly_buckets:
                    hourly_buckets[hour_key] = {
                        "hourKey": hour_key,
                        "dateString": r["dateString"],
                        "hour": hour,
                        "forecasts": [],
                        "actuals": [],
                        "hasMissingActual": False,
                    }

                b = hourly_buckets[hour_key]
                if pd.notna(r["forecastGeneration"]):
                    b["forecasts"].append(float(r["forecastGeneration"]))
                if pd.notna(r["actualGeneration"]):
                    b["actuals"].append(float(r["actualGeneration"]))
                else:
                    b["hasMissingActual"] = True

            result = []
            for b in hourly_buckets.values():
                forecast = round(float(np.mean(b["forecasts"])), 1) if b["forecasts"] else None
                actual = round(float(np.mean(b["actuals"])), 1) if b["actuals"] else None
                signed_err = round(forecast - actual, 1) if forecast is not None and actual is not None else None
                abs_err = round(abs(signed_err), 1) if signed_err is not None else None

                result.append({
                    "timestamp": b["hourKey"],
                    "dateString": b["dateString"],
                    "settlementPeriod": b["hour"] * 2 + 1,
                    "label": f"{b['dateString'][5:]} {b['hour']:02d}:00",
                    "forecast": forecast,
                    "actual": actual,
                    "signedError": signed_err,
                    "absoluteError": abs_err,
                    "isMissingActual": b["hasMissingActual"] and actual is None,
                    "isGenuineZero": actual == 0.0,
                    "isUnmatched": False,
                })
            return result

        if aggregation == "daily":
            daily_metrics = MetricsEngine.compute_daily_metrics(df)
            return [
                {
                    "timestamp": f"{d['date']}T00:00:00Z",
                    "dateString": d["date"],
                    "label": d["date"][5:],
                    "forecast": d["avgForecastMW"],
                    "actual": d["avgActualMW"],
                    "signedError": d["meanSignedError"],
                    "absoluteError": d["mae"],
                    "mae": d["mae"],
                    "rmse": d["rmse"],
                    "coveragePercent": d["coveragePercent"],
                    "isMissingActual": False,
                    "isGenuineZero": False,
                    "isUnmatched": False,
                }
                for d in daily_metrics
            ]

        return []


metrics_engine = MetricsEngine()
