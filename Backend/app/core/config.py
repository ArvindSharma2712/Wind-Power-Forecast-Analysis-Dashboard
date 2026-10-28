"""
Application Configuration Settings
Provides environment-aware configuration for the WindInsight FastAPI service.
"""

from pathlib import Path
from typing import List
import os

class Settings:
    PROJECT_NAME: str = "WindInsight • Wind Power Forecast Analysis API"
    VERSION: str = "2.0.0"
    DESCRIPTION: str = (
        "High-performance decision-support API for UK Electricity Utility "
        "day-ahead wind power forecast error analysis, BMRS data ingestion, and quality auditing."
    )
    API_PREFIX: str = "/api"
    
    # Server configuration
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    # Directories
    APP_DIR: Path = Path(__file__).resolve().parent.parent
    BACKEND_DIR: Path = APP_DIR.parent
    PROJECT_ROOT: Path = BACKEND_DIR.parent
    ASSETS_DIR: Path = PROJECT_ROOT / "assets"
    
    # Domain specific parameters
    TIMEZONE: str = "Europe/London"
    EVALUATION_START: str = "2026-01-01"
    EVALUATION_END: str = "2026-01-31"
    SETTLEMENT_RESOLUTION_MINUTES: int = 30
    SETTLEMENT_PERIODS_PER_DAY: int = 48
    TOTAL_EVALUATION_INTERVALS: int = 31 * 48  # 1,488 half-hour settlement periods
    
    # Day-Ahead Gate Closure Rules
    DAY_AHEAD_GATE_HOUR_GMT: int = 17  # 17:00 GMT on D-1
    
    # Elexon BMRS Configuration
    BMRS_API_BASE_URL: str = "https://data.elexon.co.uk/bmrs/api/v1"
    BMRS_API_KEY: str = os.getenv("BMRS_API_KEY", "")
    
    # CORS Configuration
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*",
    ]

settings = Settings()
