"""
Central In-Memory and Pandas Data Repository
Manages pre-indexed datasets with fast querying and mode switching.
"""

from typing import List, Dict, Any, Optional
import pandas as pd
from .benchmark_generator import generate_january_2026_dataset, BENCHMARK_METADATA
from .asset_loader import load_bmrs_assets, transform_windfor_assets


class DataRepository:
    def __init__(self):
        self.current_mode: str = "january-2026"
        self._raw_assets: Dict[str, Any] = {}
        self._benchmark_records: List[Dict[str, Any]] = []
        self._asset_records: List[Dict[str, Any]] = []
        self._df_benchmark: Optional[pd.DataFrame] = None
        self._df_assets: Optional[pd.DataFrame] = None
        self.initialize()

    def initialize(self):
        """Initializes datasets and builds optimized Pandas DataFrames."""
        # 1. Benchmark January 2026 dataset (1,488 intervals)
        self._benchmark_records = generate_january_2026_dataset()
        self._df_benchmark = pd.DataFrame(self._benchmark_records)

        # 2. Raw BMRS assets from assets/ folder
        self._raw_assets = load_bmrs_assets()
        windfor_records = self._raw_assets.get("windforRecords", [])
        self._asset_records = transform_windfor_assets(windfor_records)
        self._df_assets = pd.DataFrame(self._asset_records) if self._asset_records else pd.DataFrame()

    def get_mode(self) -> str:
        return self.current_mode

    def set_mode(self, mode: str):
        if mode in ("january-2026", "assets-stream"):
            self.current_mode = mode
        else:
            raise ValueError(f"Invalid mode: {mode}. Allowed: 'january-2026', 'assets-stream'")

    def get_raw_assets(self) -> Dict[str, Any]:
        return self._raw_assets

    def get_active_records(self) -> List[Dict[str, Any]]:
        if self.current_mode == "assets-stream":
            return self._asset_records
        return self._benchmark_records

    def get_active_dataframe(self) -> pd.DataFrame:
        if self.current_mode == "assets-stream":
            return self._df_assets.copy()
        return self._df_benchmark.copy()

    def get_metadata(self) -> Dict[str, Any]:
        if self.current_mode == "assets-stream":
            return self._raw_assets.get("metadata", {})
        return BENCHMARK_METADATA

    def filter_dataframe(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        settlement_period: Optional[str] = None,
    ) -> pd.DataFrame:
        """Filters active DataFrame efficiently using Pandas vector queries."""
        df = self.get_active_dataframe()
        if df.empty:
            return df

        if start_date:
            df = df[df["dateString"] >= start_date]
        if end_date:
            df = df[df["dateString"] <= end_date]

        if settlement_period and settlement_period != "all":
            try:
                sp_num = int(settlement_period)
                df = df[df["settlementPeriod"] == sp_num]
            except ValueError:
                pass

        return df

    def filter_records(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        settlement_period: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """Returns filtered records as Python dictionaries."""
        filtered_df = self.filter_dataframe(start_date, end_date, settlement_period)
        return filtered_df.to_dict(orient="records")


# Global singleton instance
data_repository = DataRepository()
