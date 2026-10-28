"""
Benchmark Dataset Generator for January 1–31, 2026
Simulates UK Elexon BMRS WINDFOR (Day-Ahead Forecasts) and FUELHH (Actual Wind Generation).

Evaluation Period: 31 days * 48 half-hour settlement periods = 1,488 intervals.
Models:
- Realistic synoptic British weather archetypes (e.g., Storm Eowyn ramp, Dunkelflaute calm periods).
- Diurnal wind cycle dynamics (late afternoon peaks).
- Strict separation between genuine 0.0 MW calm generation and null missing telemetry gaps.
- Day-Ahead gate closure (17:00 GMT on D-1) to eliminate lookahead bias.
"""

import math
from typing import List, Dict, Any


class PseudoRandom:
    """Deterministic Park-Miller Pseudo-Random Number Generator (PRNG)."""
    def __init__(self, seed: int = 20260101):
        self.s = seed % 2147483647
        if self.s <= 0:
            self.s += 2147483646

    def next(self) -> float:
        self.s = (self.s * 16807) % 2147483647
        return (self.s - 1) / 2147483646


def generate_january_2026_dataset() -> List[Dict[str, Any]]:
    """Generates all 1,488 settlement period records for January 2026."""
    records = []
    prng = PseudoRandom(20260101)

    daily_weather_archetypes = [
        {"day": 1, "baseMW": 9200, "volatility": 0.12, "forecastBias": 200},
        {"day": 2, "baseMW": 10500, "volatility": 0.15, "forecastBias": -150},
        {"day": 3, "baseMW": 11800, "volatility": 0.14, "forecastBias": 350},
        {"day": 4, "baseMW": 8400, "volatility": 0.10, "forecastBias": -100},
        {"day": 5, "baseMW": 5600, "volatility": 0.12, "forecastBias": 250},
        # Jan 6-9: High pressure anticyclone ("Dunkelflaute" low wind event)
        {"day": 6, "baseMW": 3200, "volatility": 0.08, "forecastBias": 400},
        {"day": 7, "baseMW": 2100, "volatility": 0.06, "forecastBias": 300},
        {"day": 8, "baseMW": 1650, "volatility": 0.05, "forecastBias": 150},  # Has genuine 0.0 MW & missing actuals
        {"day": 9, "baseMW": 2400, "volatility": 0.07, "forecastBias": -50},
        {"day": 10, "baseMW": 4800, "volatility": 0.14, "forecastBias": -300},
        # Jan 11-16: Major Atlantic winter storm system ("Storm Eowyn") with rapid ramp
        {"day": 11, "baseMW": 8900, "volatility": 0.18, "forecastBias": -600},
        {"day": 12, "baseMW": 13400, "volatility": 0.22, "forecastBias": 850},
        {"day": 13, "baseMW": 16200, "volatility": 0.20, "forecastBias": -1100},
        {"day": 14, "baseMW": 17800, "volatility": 0.25, "forecastBias": 1450},  # Peak storm & timing lag
        {"day": 15, "baseMW": 15900, "volatility": 0.22, "forecastBias": -950},
        {"day": 16, "baseMW": 12400, "volatility": 0.18, "forecastBias": 400},
        # Jan 17-23: Unsettled westerlies, typical UK winter generation
        {"day": 17, "baseMW": 9800, "volatility": 0.15, "forecastBias": -200},
        {"day": 18, "baseMW": 10200, "volatility": 0.14, "forecastBias": 180},
        {"day": 19, "baseMW": 8700, "volatility": 0.16, "forecastBias": 320},  # Has telemetry gaps
        {"day": 20, "baseMW": 7400, "volatility": 0.12, "forecastBias": -280},
        {"day": 21, "baseMW": 9100, "volatility": 0.15, "forecastBias": 150},
        {"day": 22, "baseMW": 11300, "volatility": 0.16, "forecastBias": -400},
        {"day": 23, "baseMW": 13100, "volatility": 0.17, "forecastBias": 550},
        # Jan 24-28: Variable gusty front with localized curtailment
        {"day": 24, "baseMW": 12600, "volatility": 0.15, "forecastBias": -320},
        {"day": 25, "baseMW": 9900, "volatility": 0.14, "forecastBias": 220},
        {"day": 26, "baseMW": 7800, "volatility": 0.13, "forecastBias": -180},
        {"day": 27, "baseMW": 6900, "volatility": 0.12, "forecastBias": 420},  # Has missing actuals
        {"day": 28, "baseMW": 8500, "volatility": 0.14, "forecastBias": -250},
        # Jan 29-31: End of month Atlantic low
        {"day": 29, "baseMW": 11200, "volatility": 0.16, "forecastBias": 380},
        {"day": 30, "baseMW": 14300, "volatility": 0.19, "forecastBias": -500},
        {"day": 31, "baseMW": 13800, "volatility": 0.18, "forecastBias": 260},
    ]

    missing_windows = [
        {"day": 8, "startSP": 14, "endSP": 17, "reason": "BMRS FUELHH aggregation feed interruption"},
        {"day": 19, "startSP": 28, "endSP": 33, "reason": "Telemetry gateway timeout during storm maintenance"},
        {"day": 27, "startSP": 8, "endSP": 11, "reason": "Substation SCADA link degradation"},
    ]

    record_counter = 1

    for day in range(1, 32):
        day_str = f"{day:02d}"
        date_str = f"2026-01-{day_str}"
        archetype = daily_weather_archetypes[day - 1]

        prev_day = f"{day - 1:02d}" if day > 1 else "31"
        prev_month = "01" if day > 1 else "12"
        prev_year = "2026" if day > 1 else "2025"
        day_ahead_pub_time = f"{prev_year}-{prev_month}-{prev_day}T16:00:00Z"

        for sp in range(1, 49):
            start_mins = (sp - 1) * 30
            end_mins = sp * 30

            start_h = f"{start_mins // 60:02d}"
            start_m = f"{start_mins % 60:02d}"
            end_h = f"{end_mins // 60:02d}"
            end_m = f"{end_mins % 60:02d}"

            delivery_start = f"{date_str}T{start_h}:{start_m}:00Z"
            delivery_end = f"{date_str}T{end_h}:{end_m}:00Z"

            diurnal_factor = 1.0 + 0.18 * math.sin(((sp - 12) / 48) * 2 * math.pi)
            sub_harmonic = 0.06 * math.cos(((sp - 6) / 24) * 2 * math.pi)

            rand_noise_actual = (prng.next() - 0.5) * 2 * archetype["volatility"]
            actual_val = archetype["baseMW"] * (diurnal_factor + sub_harmonic) * (1.0 + rand_noise_actual)
            actual_val = max(0.0, round(actual_val, 1))

            # Genuine zero calm wind event on Day 8 SP 20-22
            is_genuine_zero = False
            if day == 8 and 20 <= sp <= 22:
                actual_val = 0.0
                is_genuine_zero = True

            # Forecast generation modeling
            forecast_noise = (prng.next() - 0.48) * 1.8 * archetype["volatility"]
            ramp_phase_lag = math.sin((sp / 48) * 4 * math.pi) * 400
            forecast_val = actual_val + archetype["forecastBias"] + ramp_phase_lag + forecast_noise * archetype["baseMW"] * 0.7
            forecast_val = max(0.0, round(forecast_val, 1))

            # Planned telemetry missing window check
            missing_win = next((w for w in missing_windows if w["day"] == day and w["startSP"] <= sp <= w["endSP"]), None)
            is_unmatched = (day == 1 and sp == 1) or (day == 31 and sp == 48)

            actual_output = actual_val
            is_missing_actual = False
            quality_note = None

            if missing_win is not None:
                actual_output = None
                is_missing_actual = True
                quality_note = missing_win["reason"]
            elif is_unmatched:
                actual_output = None
                quality_note = "Excluded: Published after day-ahead cutoff or boundary interval"

            signed_error = None
            absolute_error = None
            if actual_output is not None and forecast_val is not None:
                signed_error = round(forecast_val - actual_output, 1)
                absolute_error = round(abs(signed_error), 1)

            records.append({
                "id": f"WIND-202601-{record_counter}",
                "dateString": date_str,
                "settlementPeriod": sp,
                "deliveryStartTime": delivery_start,
                "deliveryEndTime": delivery_end,
                "forecastPublicationTime": day_ahead_pub_time,
                "decisionCutoff": "Day-Ahead 17:00 Gate",
                "fuelType": "WIND",
                "forecastGeneration": forecast_val,
                "actualGeneration": actual_output,
                "signedError": signed_error,
                "absoluteError": absolute_error,
                "isMissingActual": is_missing_actual,
                "isUnmatched": is_unmatched,
                "isGenuineZero": is_genuine_zero,
                "isFromAssetsFile": False,
                "qualityNote": quality_note,
            })
            record_counter += 1

    return records


BENCHMARK_METADATA = {
    "dataSource": "High-Fidelity Synthetic Model simulating UK Elexon BMRS WINDFOR & FUELHH",
    "periodStart": "2026-01-01T00:00:00Z",
    "periodEnd": "2026-01-31T23:30:00Z",
    "totalSettlementPeriods": 1488,
    "settlementResolutionMinutes": 30,
    "plannedMissingObservations": 14,
    "unmatchedRecords": 2,
    "isDemonstrationData": True,
    "targetMarket": "UK Electricity Market (NGET / Elexon BSC)",
    "version": "2.0.0-python-fastapi",
}
