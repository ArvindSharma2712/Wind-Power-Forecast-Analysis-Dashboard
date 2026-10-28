/**
 * Statistical and error metrics calculations for Wind Power forecasts vs actuals
 * Strictly conforms to:
 * - Signed error: e_i = F_i - A_i
 * - Absolute error: AE_i = |F_i - A_i|
 * - MAE = (1/n) * sum(|F_i - A_i|)
 * - RMSE = sqrt((1/n) * sum((F_i - A_i)^2))
 * - Mean Signed Error = (1/n) * sum(F_i - A_i)
 * 
 * Unmatched records or missing observations (null) are strictly excluded from accuracy metrics.
 */

/**
 * Filter valid matched records where both forecast and actual are present and non-negative
 */
export function getMatchedRecords(records = []) {
  return records.filter(
    (r) =>
      r &&
      r.forecastGeneration !== null &&
      r.forecastGeneration !== undefined &&
      !isNaN(r.forecastGeneration) &&
      r.actualGeneration !== null &&
      r.actualGeneration !== undefined &&
      !isNaN(r.actualGeneration)
  );
}

/**
 * Computes overall summary statistics for a given array of interval records
 */
export function calculateOverallMetrics(records = [], expectedTotalIntervals = null) {
  const matched = getMatchedRecords(records);
  const totalRecords = records.length;
  const n = matched.length;

  if (n === 0) {
    return {
      n: 0,
      totalRecords,
      expectedIntervals: expectedTotalIntervals || totalRecords,
      coveragePercent: 0,
      avgForecastMW: null,
      avgActualMW: null,
      mae: null,
      rmse: null,
      meanSignedError: null,
      maxAbsoluteError: null,
      normalizedMaePercent: null,
      biasDirection: 'neutral',
      unmatchedCount: records.filter((r) => r.isUnmatched).length,
      missingActualCount: records.filter((r) => r.isMissingActual).length,
    };
  }

  let sumForecast = 0;
  let sumActual = 0;
  let sumAbsError = 0;
  let sumSquaredError = 0;
  let sumSignedError = 0;
  let maxAbsError = 0;

  for (let i = 0; i < n; i++) {
    const f = matched[i].forecastGeneration;
    const a = matched[i].actualGeneration;
    const signedErr = f - a;
    const absErr = Math.abs(signedErr);

    sumForecast += f;
    sumActual += a;
    sumAbsError += absErr;
    sumSquaredError += signedErr * signedErr;
    sumSignedError += signedErr;

    if (absErr > maxAbsError) {
      maxAbsError = absErr;
    }
  }

  const avgForecast = sumForecast / n;
  const avgActual = sumActual / n;
  const mae = sumAbsError / n;
  const rmse = Math.sqrt(sumSquaredError / n);
  const meanSignedError = sumSignedError / n;
  const normalizedMaePercent = avgActual > 0 ? (mae / avgActual) * 100 : null;

  let biasDirection = 'neutral';
  if (meanSignedError > 25) {
    biasDirection = 'overforecasting'; // Forecasts tend to exceed actuals
  } else if (meanSignedError < -25) {
    biasDirection = 'underforecasting'; // Forecasts tend to lag actuals
  }

  const expected = expectedTotalIntervals || totalRecords;
  const coveragePercent = expected > 0 ? (n / expected) * 100 : 0;

  const unmatchedCount = records.filter((r) => r.isUnmatched).length;
  const missingActualCount = records.filter((r) => r.isMissingActual).length;

  return {
    n,
    totalRecords,
    expectedIntervals: expected,
    coveragePercent,
    avgForecastMW: avgForecast,
    avgActualMW: avgActual,
    mae,
    rmse,
    meanSignedError,
    maxAbsoluteError: maxAbsError,
    normalizedMaePercent,
    biasDirection,
    unmatchedCount,
    missingActualCount,
  };
}

/**
 * Aggregates records by calendar day (e.g., '2026-01-01')
 * Calculates daily MAE, RMSE, Avg Forecast, Avg Actual, and coverage
 */
export function calculateDailyMetrics(records = []) {
  const dayMap = new Map();

  for (const record of records) {
    const dayKey = record.dateString || record.deliveryStartTime?.slice(0, 10);
    if (!dayKey) continue;

    if (!dayMap.has(dayKey)) {
      dayMap.set(dayKey, []);
    }
    dayMap.get(dayKey).push(record);
  }

  const dailyResults = [];

  for (const [dayKey, dayRecords] of dayMap.entries()) {
    const metrics = calculateOverallMetrics(dayRecords, 48); // Standard 48 periods per day in UK
    dailyResults.push({
      date: dayKey,
      dayNumber: parseInt(dayKey.slice(8, 10), 10),
      totalIntervals: dayRecords.length,
      matchedIntervals: metrics.n,
      coveragePercent: metrics.coveragePercent,
      avgForecastMW: metrics.avgForecastMW,
      avgActualMW: metrics.avgActualMW,
      mae: metrics.mae,
      rmse: metrics.rmse,
      meanSignedError: metrics.meanSignedError,
      maxAbsoluteError: metrics.maxAbsoluteError,
    });
  }

  // Sort chronologically
  dailyResults.sort((a, b) => a.date.localeCompare(b.date));
  return dailyResults;
}

/**
 * Identifies the best day (lowest MAE) and worst day (highest MAE)
 * requires minimum matched interval threshold (at least 24 intervals = 12 hours)
 */
export function findBestAndWorstDays(dailyMetrics = []) {
  const qualified = dailyMetrics.filter((d) => d.matchedIntervals >= 24 && d.mae !== null);
  if (qualified.length === 0) return { bestDay: null, worstDay: null };

  let best = qualified[0];
  let worst = qualified[0];

  for (const day of qualified) {
    if (day.mae < best.mae) {
      best = day;
    }
    if (day.mae > worst.mae) {
      worst = day;
    }
  }

  return { bestDay: best, worstDay: worst };
}

/**
 * Aggregates records into error distribution bins for an error histogram
 * e.g., [-3000 to -2000, -2000 to -1000, -1000 to 0, 0 to 1000, 1000 to 2000, 2000 to 3000, > 3000]
 */
export function calculateErrorDistribution(records = []) {
  const matched = getMatchedRecords(records);
  if (matched.length === 0) return [];

  // Bins in MW
  const bins = [
    { label: '< -3000', min: -Infinity, max: -3000, count: 0 },
    { label: '-3000 to -2000', min: -3000, max: -2000, count: 0 },
    { label: '-2000 to -1000', min: -2000, max: -1000, count: 0 },
    { label: '-1000 to 0', min: -1000, max: 0, count: 0 },
    { label: '0 to +1000', min: 0, max: 1000, count: 0 },
    { label: '+1000 to +2000', min: 1000, max: 2000, count: 0 },
    { label: '+2000 to +3000', min: 2000, max: 3000, count: 0 },
    { label: '> +3000', min: 3000, max: Infinity, count: 0 },
  ];

  for (const r of matched) {
    const signedErr = r.forecastGeneration - r.actualGeneration;
    for (const bin of bins) {
      if (signedErr >= bin.min && signedErr < bin.max) {
        bin.count++;
        break;
      }
    }
  }

  const total = matched.length;
  return bins.map((b) => ({
    ...b,
    percentage: total > 0 ? (b.count / total) * 100 : 0,
  }));
}

/**
 * Aggregates by Settlement Period (1 to 48) to reveal diurnal/hourly forecast error profiles
 */
export function calculateDiurnalProfile(records = []) {
  const periodMap = new Map();

  for (let sp = 1; sp <= 48; sp++) {
    periodMap.set(sp, []);
  }

  for (const r of records) {
    if (r.settlementPeriod && periodMap.has(r.settlementPeriod)) {
      periodMap.get(r.settlementPeriod).push(r);
    }
  }

  const profile = [];
  for (let sp = 1; sp <= 48; sp++) {
    const list = periodMap.get(sp) || [];
    const metrics = calculateOverallMetrics(list);
    const startM = (sp - 1) * 30;
    const h = Math.floor(startM / 60).toString().padStart(2, '0');
    const m = (startM % 60).toString().padStart(2, '0');

    profile.push({
      settlementPeriod: sp,
      timeLabel: `${h}:${m}`,
      mae: metrics.mae,
      meanSignedError: metrics.meanSignedError,
      avgForecastMW: metrics.avgForecastMW,
      avgActualMW: metrics.avgActualMW,
      sampleCount: metrics.n,
    });
  }

  return profile;
}
