/**
 * Analytics and Data Service Layer
 * 
 * Provides an enterprise-grade client interface communicating directly with the
 * high-performance Python 3.13 FastAPI backend (`/api/...`).
 * 
 * Automatically detects backend availability:
 * - When FastAPI backend is online: streams real-time Pandas-computed metrics,
 *   vectorized aggregations, and BMRS diagnostics.
 * - Graceful fallback: maintains client-side in-memory analytics if backend is restarting.
 */

import { mockWindRecords, mockDatasetMetadata } from '../data/mockWindData';
import { rawBMRSAssets, getTransformedAssetRecords } from '../data/rawBMRSAssets';
import {
  calculateOverallMetrics,
  calculateDailyMetrics,
  findBestAndWorstDays,
  calculateErrorDistribution,
  calculateDiurnalProfile,
  getMatchedRecords,
} from '../utils/metrics';

// Backend API Base URL (proxied via Vite /api to http://127.0.0.1:8000)
const API_BASE = '/api';

// Global dataset mode: 'january-2026' (default challenge period) or 'assets-stream'
let currentDataMode = 'january-2026';

// Backend connection state cache
let backendState = {
  tested: false,
  connected: false,
  details: null,
  lastChecked: 0,
};

/**
 * Checks FastAPI backend health with a fast non-blocking timeout
 */
async function checkBackendHealth() {
  const now = Date.now();
  // Cache health checks for 5 seconds
  if (backendState.tested && now - backendState.lastChecked < 5000) {
    return backendState.connected;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const response = await fetch(`${API_BASE}/health`, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      backendState = {
        tested: true,
        connected: true,
        details: data,
        lastChecked: now,
      };
      return true;
    }
  } catch (err) {
    // Backend offline / unreachable
  }

  backendState = {
    tested: true,
    connected: false,
    details: null,
    lastChecked: now,
  };
  return false;
}

function getActiveRecords() {
  if (currentDataMode === 'assets-stream') {
    return getTransformedAssetRecords();
  }
  return mockWindRecords;
}

// Local helper to filter records when offline
function filterRecords(records, { startDate, endDate, settlementPeriod } = {}) {
  let filtered = [...records];

  if (startDate) {
    filtered = filtered.filter((r) => r.dateString >= startDate);
  }
  if (endDate) {
    filtered = filtered.filter((r) => r.dateString <= endDate);
  }
  if (settlementPeriod && settlementPeriod !== 'all') {
    const spNum = parseInt(settlementPeriod, 10);
    if (!isNaN(spNum)) {
      filtered = filtered.filter((r) => r.settlementPeriod === spNum);
    }
  }

  return filtered;
}

/**
 * Service API Object
 */
export const analyticsService = {
  /**
   * Get active dataset mode
   */
  getDataMode() {
    return currentDataMode;
  },

  /**
   * Set dataset mode ('january-2026' or 'assets-stream')
   * Synchronizes with both local state and Python backend.
   */
  async setDataMode(mode) {
    if (mode === 'assets-stream' || mode === 'january-2026') {
      currentDataMode = mode;

      const isOnline = await checkBackendHealth();
      if (isOnline) {
        try {
          await fetch(`${API_BASE}/dataset/switch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mode }),
          });
        } catch (e) {
          console.warn('[WindInsight Service] Backend mode sync warning:', e);
        }
      }
    }
  },

  /**
   * Inspect raw BMRS assets from user directory
   */
  getRawAssetData() {
    return rawBMRSAssets;
  },

  /**
   * Health check endpoint: queries `GET /api/health`
   */
  async getHealthStatus() {
    const isOnline = await checkBackendHealth();

    if (isOnline && backendState.details) {
      return {
        ...backendState.details,
        backendConnected: true,
        mode: currentDataMode,
      };
    }

    return {
      status: 'ok',
      mode: currentDataMode,
      version: '2.0.0-preview',
      message:
        currentDataMode === 'assets-stream'
          ? 'Serving real Elexon BMRS WINDFOR stream response from assets/'
          : 'Serving January 2026 challenge evaluation dataset (1,488 SPs)',
      backendConnected: false,
      timestamp: new Date().toISOString(),
    };
  },

  /**
   * Fetch KPI metrics and summary statistics for a given date range
   * Queries FastAPI `GET /api/analysis` with graceful client-side fallback
   */
  async getAnalysisMetrics({ startDate, endDate } = {}) {
    const effectiveStart =
      startDate || (currentDataMode === 'assets-stream' ? '2026-10-26' : '2026-01-01');
    const effectiveEnd =
      endDate || (currentDataMode === 'assets-stream' ? '2026-10-29' : '2026-01-31');

    const isOnline = await checkBackendHealth();

    if (isOnline) {
      try {
        const queryParams = new URLSearchParams({
          startDate: effectiveStart,
          endDate: effectiveEnd,
        });
        const res = await fetch(`${API_BASE}/analysis?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          return {
            ...data,
            backendConnected: true,
          };
        }
      } catch (err) {
        console.warn('[WindInsight Service] Falling back to client computation:', err);
      }
    }

    // Local client-side fallback
    const activeRecords = getActiveRecords();
    const filtered = filterRecords(activeRecords, {
      startDate: effectiveStart,
      endDate: effectiveEnd,
    });

    const totalDays = Math.max(
      1,
      Math.round((new Date(effectiveEnd) - new Date(effectiveStart)) / (1000 * 60 * 60 * 24)) + 1
    );
    const expectedIntervals = totalDays * 48;

    const overall = calculateOverallMetrics(filtered, expectedIntervals);
    const daily = calculateDailyMetrics(filtered);
    const { bestDay, worstDay } = findBestAndWorstDays(daily);
    const distribution = calculateErrorDistribution(filtered);
    const diurnal = calculateDiurnalProfile(filtered);

    const matched = getMatchedRecords(filtered);
    const significantErrors = [...matched]
      .sort((a, b) => (b.absoluteError || 0) - (a.absoluteError || 0))
      .slice(0, 10);

    return {
      metadata: {
        ...(currentDataMode === 'assets-stream' ? rawBMRSAssets.metadata : mockDatasetMetadata),
        queryPeriod: { startDate: effectiveStart, endDate: effectiveEnd },
        mode: currentDataMode,
      },
      overall,
      daily,
      bestDay,
      worstDay,
      distribution,
      diurnal,
      significantErrors,
      backendConnected: false,
    };
  },

  /**
   * Fetch time-series generation data with customizable aggregation
   * Queries FastAPI `GET /api/timeseries`
   */
  async getTimeSeriesData({
    startDate,
    endDate,
    aggregation = '30min',
  } = {}) {
    const effectiveStart =
      startDate || (currentDataMode === 'assets-stream' ? '2026-10-26' : '2026-01-01');
    const effectiveEnd =
      endDate || (currentDataMode === 'assets-stream' ? '2026-10-29' : '2026-01-31');

    const isOnline = await checkBackendHealth();

    if (isOnline) {
      try {
        const queryParams = new URLSearchParams({
          startDate: effectiveStart,
          endDate: effectiveEnd,
          aggregation,
        });
        const res = await fetch(`${API_BASE}/timeseries?${queryParams.toString()}`);
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn('[WindInsight Service] Falling back to client time-series calculation:', err);
      }
    }

    // Local client-side fallback
    const activeRecords = getActiveRecords();
    const filtered = filterRecords(activeRecords, {
      startDate: effectiveStart,
      endDate: effectiveEnd,
    });

    if (aggregation === '30min') {
      return filtered.map((r) => ({
        timestamp: r.deliveryStartTime,
        dateString: r.dateString,
        settlementPeriod: r.settlementPeriod,
        label: `${r.dateString.slice(5)} SP${r.settlementPeriod}`,
        forecast: r.forecastGeneration,
        actual: r.actualGeneration,
        signedError: r.signedError,
        absoluteError: r.absoluteError,
        isMissingActual: r.isMissingActual,
        isGenuineZero: r.isGenuineZero,
        isUnmatched: r.isUnmatched,
      }));
    }

    if (aggregation === 'hourly') {
      const hourlyMap = new Map();

      for (const r of filtered) {
        const hour = Math.floor((r.settlementPeriod - 1) / 2);
        const hourKey = `${r.dateString}T${hour.toString().padStart(2, '0')}:00:00Z`;

        if (!hourlyMap.has(hourKey)) {
          hourlyMap.set(hourKey, {
            hourKey,
            dateString: r.dateString,
            hour,
            forecastSum: 0,
            forecastCount: 0,
            actualSum: 0,
            actualCount: 0,
            hasMissingActual: false,
          });
        }

        const bucket = hourlyMap.get(hourKey);
        if (r.forecastGeneration !== null) {
          bucket.forecastSum += r.forecastGeneration;
          bucket.forecastCount++;
        }
        if (r.actualGeneration !== null) {
          bucket.actualSum += r.actualGeneration;
          bucket.actualCount++;
        } else {
          bucket.hasMissingActual = true;
        }
      }

      return Array.from(hourlyMap.values()).map((b) => {
        const forecast = b.forecastCount > 0 ? Math.round((b.forecastSum / b.forecastCount) * 10) / 10 : null;
        const actual = b.actualCount > 0 ? Math.round((b.actualSum / b.actualCount) * 10) / 10 : null;
        const signedError = forecast !== null && actual !== null ? Math.round((forecast - actual) * 10) / 10 : null;
        const absoluteError = signedError !== null ? Math.abs(signedError) : null;

        return {
          timestamp: b.hourKey,
          dateString: b.dateString,
          label: `${b.dateString.slice(5)} ${b.hour.toString().padStart(2, '0')}:00`,
          forecast,
          actual,
          signedError,
          absoluteError,
          isMissingActual: b.hasMissingActual && actual === null,
          isGenuineZero: actual === 0,
        };
      });
    }

    if (aggregation === 'daily') {
      const daily = calculateDailyMetrics(filtered);
      return daily.map((d) => ({
        timestamp: `${d.date}T00:00:00Z`,
        dateString: d.date,
        label: d.date.slice(5),
        forecast: d.avgForecastMW,
        actual: d.avgActualMW,
        signedError: d.meanSignedError,
        absoluteError: d.mae,
        mae: d.mae,
        rmse: d.rmse,
        coveragePercent: d.coveragePercent,
      }));
    }

    return [];
  },

  /**
   * Fetch paginated and filterable forecast & actual records
   * Queries FastAPI `GET /api/forecasts`
   */
  async getForecastExplorerRecords({
    startDate,
    endDate,
    settlementPeriod = 'all',
    search = '',
    errorFilter = 'all',
    sortBy = 'deliveryStartTime',
    sortOrder = 'asc',
    page = 1,
    pageSize = 20,
  } = {}) {
    const effectiveStart =
      startDate || (currentDataMode === 'assets-stream' ? '2026-10-26' : '2026-01-01');
    const effectiveEnd =
      endDate || (currentDataMode === 'assets-stream' ? '2026-10-29' : '2026-01-31');

    const isOnline = await checkBackendHealth();

    if (isOnline) {
      try {
        const queryParams = new URLSearchParams({
          startDate: effectiveStart,
          endDate: effectiveEnd,
          settlementPeriod,
          search,
          errorFilter,
          sortBy,
          sortOrder,
          page: String(page),
          pageSize: String(pageSize),
        });
        const res = await fetch(`${API_BASE}/forecasts?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          return {
            ...data,
            backendConnected: true,
          };
        }
      } catch (err) {
        console.warn('[WindInsight Service] Falling back to client table pagination:', err);
      }
    }

    // Local client-side fallback
    const activeRecords = getActiveRecords();
    let filtered = filterRecords(activeRecords, {
      startDate: effectiveStart,
      endDate: effectiveEnd,
      settlementPeriod,
    });

    if (errorFilter === 'missing_actual') {
      filtered = filtered.filter((r) => r.isMissingActual);
    } else if (errorFilter === 'high_error') {
      filtered = filtered.filter((r) => r.absoluteError !== null && r.absoluteError >= 1500);
    } else if (errorFilter === 'moderate_error') {
      filtered = filtered.filter((r) => r.absoluteError !== null && r.absoluteError >= 500 && r.absoluteError < 1500);
    } else if (errorFilter === 'low_error') {
      filtered = filtered.filter((r) => r.absoluteError !== null && r.absoluteError < 500);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter((r) => {
        return (
          r.id.toLowerCase().includes(q) ||
          r.dateString.includes(q) ||
          `sp ${r.settlementPeriod}`.includes(q) ||
          (r.qualityNote && r.qualityNote.toLowerCase().includes(q))
        );
      });
    }

    filtered.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (typeof valA === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const startIndex = (page - 1) * pageSize;
    const paginatedRecords = filtered.slice(startIndex, startIndex + pageSize);

    return {
      records: paginatedRecords,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
      dataMode: currentDataMode,
      backendConnected: false,
    };
  },

  /**
   * Fetch Data Quality breakdown and anomaly records
   * Queries FastAPI `GET /api/quality`
   */
  async getDataQualityReport({ startDate, endDate } = {}) {
    const effectiveStart =
      startDate || (currentDataMode === 'assets-stream' ? '2026-10-26' : '2026-01-01');
    const effectiveEnd =
      endDate || (currentDataMode === 'assets-stream' ? '2026-10-29' : '2026-01-31');

    const isOnline = await checkBackendHealth();

    if (isOnline) {
      try {
        const queryParams = new URLSearchParams({
          startDate: effectiveStart,
          endDate: effectiveEnd,
        });
        const res = await fetch(`${API_BASE}/quality?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          return {
            ...data,
            backendConnected: true,
          };
        }
      } catch (err) {
        console.warn('[WindInsight Service] Falling back to client data quality auditor:', err);
      }
    }

    // Local client-side fallback
    const activeRecords = getActiveRecords();
    const filtered = filterRecords(activeRecords, {
      startDate: effectiveStart,
      endDate: effectiveEnd,
    });

    const expected =
      (Math.max(1, Math.round((new Date(effectiveEnd) - new Date(effectiveStart)) / (1000 * 60 * 60 * 24)) + 1)) * 48;

    const matched = getMatchedRecords(filtered);
    const missingActuals = filtered.filter((r) => r.isMissingActual);
    const unmatched = filtered.filter((r) => r.isUnmatched);
    const genuineZeros = filtered.filter((r) => r.isGenuineZero);

    const qualityLogs = [
      ...missingActuals.map((r) => ({
        id: `LOG-MISS-${r.id}`,
        timestamp: r.deliveryStartTime,
        settlementPeriod: r.settlementPeriod,
        type: 'Missing Actual Generation',
        severity: 'Warning',
        dataset: 'FUELHH (Actual Wind)',
        description: r.qualityNote || 'No actual telemetry returned by BMRS for settlement interval',
        impact: 'Interval excluded from MAE and RMSE calculation',
      })),
      ...unmatched.map((r) => ({
        id: `LOG-UNM-${r.id}`,
        timestamp: r.deliveryStartTime,
        settlementPeriod: r.settlementPeriod,
        type: 'Unmatched Forecast Record',
        severity: 'Info',
        dataset: 'WINDFOR (Forecast)',
        description: r.qualityNote || 'Forecast horizon published outside gate closure matching cutoff',
        impact: 'Excluded from day-ahead purchase error analysis',
      })),
      ...genuineZeros.map((r) => ({
        id: `LOG-ZERO-${r.id}`,
        timestamp: r.deliveryStartTime,
        settlementPeriod: r.settlementPeriod,
        type: 'Zero Generation Event',
        severity: 'Valid',
        dataset: 'FUELHH (Actual Wind)',
        description: 'Genuine zero generation observed (distinguished from missing telemetry)',
        impact: 'Included in MAE calculation as 0.0 MW actual',
      })),
    ].sort((a, b) => a.timestamp.localeCompare(b.timestamp));

    return {
      summary: {
        totalForecastRecords: filtered.length,
        totalActualRecords: filtered.filter((r) => r.actualGeneration !== null).length,
        matchedDeliveryIntervals: matched.length,
        unmatchedForecastRecords: unmatched.length,
        missingActualObservations: missingActuals.length,
        genuineZeroObservations: genuineZeros.length,
        duplicateRecords: 0,
        dataCoveragePercent: expected > 0 ? (matched.length / expected) * 100 : 0,
      },
      qualityLogs,
      rawBMRSAssets,
      dataMode: currentDataMode,
      backendConnected: false,
    };
  },

  /**
   * Diagnoses Elexon BMRS query parameter conflicts
   * Calls FastAPI `POST /api/bmrs/diagnose`
   */
  async diagnoseBMRS(queryPayload) {
    try {
      const res = await fetch(`${API_BASE}/bmrs/diagnose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(queryPayload),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('BMRS diagnosis request error:', e);
    }
    return null;
  },

  /**
   * Generates direct CSV export URL
   */
  getCsvExportUrl({ startDate, endDate, settlementPeriod = 'all', errorFilter = 'all', search = '' } = {}) {
    const params = new URLSearchParams({
      startDate: startDate || (currentDataMode === 'assets-stream' ? '2026-10-26' : '2026-01-01'),
      endDate: endDate || (currentDataMode === 'assets-stream' ? '2026-10-29' : '2026-01-31'),
      settlementPeriod,
      errorFilter,
      search,
    });
    return `${API_BASE}/forecasts/export?${params.toString()}`;
  },
};
