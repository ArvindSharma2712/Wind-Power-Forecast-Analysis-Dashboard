"""
Pydantic Schemas for WindInsight API
Defines strong typing, data contracts, and serialization models.
"""

from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field


class WindRecord(BaseModel):
    id: str
    dateString: str
    settlementPeriod: int = Field(..., ge=1, le=50, description="UK Settlement Period (1-48 normally, 50 on clock change)")
    deliveryStartTime: str
    deliveryEndTime: str
    forecastPublicationTime: Optional[str] = None
    decisionCutoff: str
    fuelType: str = "WIND"
    forecastGeneration: Optional[float] = None
    actualGeneration: Optional[float] = None
    signedError: Optional[float] = None
    absoluteError: Optional[float] = None
    isMissingActual: bool = False
    isUnmatched: bool = False
    isGenuineZero: bool = False
    isFromAssetsFile: bool = False
    qualityNote: Optional[str] = None


class OverallMetrics(BaseModel):
    mae: float = Field(..., description="Mean Absolute Error in MW")
    rmse: float = Field(..., description="Root Mean Squared Error in MW")
    meanSignedError: float = Field(..., description="Systematic Forecast Bias in MW (F - A)")
    maxOverforecastMW: float = 0.0
    maxUnderforecastMW: float = 0.0
    totalMatchedIntervals: int
    expectedIntervals: int
    coveragePercent: float
    missingActualCount: int
    genuineZeroCount: int
    unmatchedCount: int
    totalRecords: int


class DailyMetric(BaseModel):
    date: str
    settlementDay: int
    mae: float
    rmse: float
    meanSignedError: float
    maxSignedError: float
    minSignedError: float
    matchedIntervals: int
    missingIntervals: int
    coveragePercent: float
    avgForecastMW: float
    avgActualMW: float
    isHighErrorDay: bool = False


class DiurnalProfileItem(BaseModel):
    settlementPeriod: int
    hourLabel: str
    avgForecastMW: float
    avgActualMW: float
    mae: float
    meanSignedError: float
    sampleCount: int


class ErrorDistributionBucket(BaseModel):
    bin: str
    count: int
    percentage: float
    rangeMin: float
    rangeMax: float


class AnalysisResponse(BaseModel):
    metadata: Dict[str, Any]
    overall: OverallMetrics
    daily: List[DailyMetric]
    bestDay: Optional[DailyMetric] = None
    worstDay: Optional[DailyMetric] = None
    distribution: List[ErrorDistributionBucket]
    diurnal: List[DiurnalProfileItem]
    significantErrors: List[WindRecord]


class TimeSeriesItem(BaseModel):
    timestamp: str
    dateString: str
    settlementPeriod: Optional[int] = None
    label: str
    forecast: Optional[float] = None
    actual: Optional[float] = None
    signedError: Optional[float] = None
    absoluteError: Optional[float] = None
    mae: Optional[float] = None
    rmse: Optional[float] = None
    coveragePercent: Optional[float] = None
    isMissingActual: bool = False
    isGenuineZero: bool = False
    isUnmatched: Optional[bool] = False


class PaginationInfo(BaseModel):
    page: int
    pageSize: int
    total: int
    totalPages: int


class ForecastExplorerResponse(BaseModel):
    records: List[WindRecord]
    pagination: PaginationInfo
    dataMode: str


class QualitySummary(BaseModel):
    totalForecastRecords: int
    totalActualRecords: int
    matchedDeliveryIntervals: int
    unmatchedForecastRecords: int
    missingActualObservations: int
    genuineZeroObservations: int
    duplicateRecords: int = 0
    dataCoveragePercent: float


class QualityLogItem(BaseModel):
    id: str
    timestamp: str
    settlementPeriod: int
    type: str
    severity: str
    dataset: str
    description: str
    impact: str


class DataQualityReport(BaseModel):
    summary: QualitySummary
    qualityLogs: List[QualityLogItem]
    rawBMRSAssets: Dict[str, Any]
    dataMode: str


class HealthResponse(BaseModel):
    status: str
    mode: str
    version: str
    message: str
    backendConnected: bool = True
    pythonVersion: str
    pandasVersion: str
    recordsCount: int
    timestamp: str


class UserProfile(BaseModel):
    name: str
    role: str
    email: str
    organization: str = "UK National Electricity Utility"


class LoginRequest(BaseModel):
    email: str
    password: str
    role: Optional[str] = "Senior Renewable Energy Trader"


class LoginResponse(BaseModel):
    token: str
    user: UserProfile


class BMRSQueryRequest(BaseModel):
    dataset: str = "FUELHH"  # or "WINDFOR"
    settlementDateFrom: str = "2026-10-26"
    settlementDateTo: str = "2026-10-29"
    publishDateTimeFrom: Optional[str] = None
    publishDateTimeTo: Optional[str] = None
    autoResolveConflicts: bool = True


class BMRSDiagnosisResponse(BaseModel):
    requestGiven: Dict[str, Any]
    isValidForBMRS: bool
    diagnosis: str
    correctedParameters: Dict[str, Any]
    explanation: str
    suggestedUrl: str


class DatasetSwitchRequest(BaseModel):
    mode: str = Field(..., pattern="^(january-2026|assets-stream)$")
