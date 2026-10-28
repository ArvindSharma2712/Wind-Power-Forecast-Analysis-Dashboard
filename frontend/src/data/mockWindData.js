/**
 * Demonstration Mock Dataset for January 1–31, 2026
 * Simulates UK Elexon BMRS WINDFOR (Forecasts) and FUELHH (Actual Wind Generation)
 * 
 * DISCLAIMER:
 * This dataset contains synthetic demonstration records generated to validate frontend
 * visualization, statistical calculation, and day-ahead utility decision workflows.
 * It is NOT live Elexon data. The data interface is designed for drop-in replacement
 * by the Python backend once implemented.
 */

// Deterministic Pseudo-Random Number Generator (PRNG) to ensure reproducible data
function pseudoRandom(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Generates all 1,488 half-hour settlement periods for January 2026
 */
function generateMockWindData() {
  const records = [];
  const rand = pseudoRandom(20260101);

  // Weather pattern envelope across the 31 days of January 2026
  // Models synoptic pressure systems across the British Isles
  const dailyWeatherArchetypes = [
    { day: 1, baseMW: 9200, volatility: 0.12, forecastBias: 200 },
    { day: 2, baseMW: 10500, volatility: 0.15, forecastBias: -150 },
    { day: 3, baseMW: 11800, volatility: 0.14, forecastBias: 350 },
    { day: 4, baseMW: 8400, volatility: 0.10, forecastBias: -100 },
    { day: 5, baseMW: 5600, volatility: 0.12, forecastBias: 250 },
    // Jan 6-9: High pressure anticyclone ("Dunkelflaute" low wind event)
    { day: 6, baseMW: 3200, volatility: 0.08, forecastBias: 400 },
    { day: 7, baseMW: 2100, volatility: 0.06, forecastBias: 300 },
    { day: 8, baseMW: 1650, volatility: 0.05, forecastBias: 150 }, // Has missing actuals
    { day: 9, baseMW: 2400, volatility: 0.07, forecastBias: -50 },
    { day: 10, baseMW: 4800, volatility: 0.14, forecastBias: -300 },
    // Jan 11-16: Major Atlantic winter storm system ("Storm Eowyn") with rapid ramp
    { day: 11, baseMW: 8900, volatility: 0.18, forecastBias: -600 },
    { day: 12, baseMW: 13400, volatility: 0.22, forecastBias: 850 },
    { day: 13, baseMW: 16200, volatility: 0.20, forecastBias: -1100 }, // High forecast error
    { day: 14, baseMW: 17800, volatility: 0.25, forecastBias: 1450 }, // Peak storm & timing lag
    { day: 15, baseMW: 15900, volatility: 0.22, forecastBias: -950 },
    { day: 16, baseMW: 12400, volatility: 0.18, forecastBias: 400 },
    // Jan 17-23: Unsettled westerlies, typical UK winter generation
    { day: 17, baseMW: 9800, volatility: 0.15, forecastBias: -200 },
    { day: 18, baseMW: 10200, volatility: 0.14, forecastBias: 180 },
    { day: 19, baseMW: 8700, volatility: 0.16, forecastBias: 320 }, // Has telemetry gaps
    { day: 20, baseMW: 7400, volatility: 0.12, forecastBias: -280 },
    { day: 21, baseMW: 9100, volatility: 0.15, forecastBias: 150 },
    { day: 22, baseMW: 11300, volatility: 0.16, forecastBias: -400 },
    { day: 23, baseMW: 13100, volatility: 0.17, forecastBias: 550 },
    // Jan 24-28: Variable gusty front with localized curtailment
    { day: 24, baseMW: 12600, volatility: 0.15, forecastBias: -320 },
    { day: 25, baseMW: 9900, volatility: 0.14, forecastBias: 220 },
    { day: 26, baseMW: 7800, volatility: 0.13, forecastBias: -180 },
    { day: 27, baseMW: 6900, volatility: 0.12, forecastBias: 420 }, // Has missing actuals
    { day: 28, baseMW: 8500, volatility: 0.14, forecastBias: -250 },
    // Jan 29-31: End of month Atlantic low
    { day: 29, baseMW: 11200, volatility: 0.16, forecastBias: 380 },
    { day: 30, baseMW: 14300, volatility: 0.19, forecastBias: -500 },
    { day: 31, baseMW: 13800, volatility: 0.18, forecastBias: 260 },
  ];

  // Specific planned missing actual observation windows to test handling
  // Missing intervals represent realistic telemetry outage on BMRS FUELHH
  const missingWindows = [
    { day: 8, startSP: 14, endSP: 17, reason: 'BMRS FUELHH aggregation feed interruption' },
    { day: 19, startSP: 28, endSP: 33, reason: 'Telemetry gateway timeout during storm maintenance' },
    { day: 27, startSP: 8, endSP: 11, reason: 'Substation SCADA link degradation' },
  ];

  let recordIdCounter = 1;

  for (let day = 1; day <= 31; day++) {
    const dayStr = day.toString().padStart(2, '0');
    const dateStr = `2026-01-${dayStr}`;
    const archetype = dailyWeatherArchetypes[day - 1] || { baseMW: 9000, volatility: 0.15, forecastBias: 0 };

    // Day-ahead purchasing decision publication time
    // Typically published day-ahead between 11:00 and 17:00 GMT on D-1
    const prevDay = day > 1 ? (day - 1).toString().padStart(2, '0') : '31';
    const prevMonth = day > 1 ? '01' : '12';
    const prevYear = day > 1 ? '2026' : '2025';
    const dayAheadPubTimeStr = `${prevYear}-${prevMonth}-${prevDay}T16:00:00Z`;

    for (let sp = 1; sp <= 48; sp++) {
      const startMinutes = (sp - 1) * 30;
      const endMinutes = sp * 30;

      const startH = Math.floor(startMinutes / 60).toString().padStart(2, '0');
      const startM = (startMinutes % 60).toString().padStart(2, '0');
      const endH = Math.floor(endMinutes / 60).toString().padStart(2, '0');
      const endM = (endMinutes % 60).toString().padStart(2, '0');

      const deliveryStartTime = `${dateStr}T${startH}:${startM}:00Z`;
      const deliveryEndTime = `${dateStr}T${endH}:${endM}:00Z`;

      // Diurnal wind pattern cycle (wind speeds offshore & onshore often peak late afternoon/evening)
      const diurnalFactor = 1 + 0.18 * Math.sin(((sp - 12) / 48) * 2 * Math.PI);
      const subHarmonic = 0.06 * Math.cos(((sp - 6) / 24) * 2 * Math.PI);

      // Base actual generation for this half-hour
      const randomNoiseActual = (rand() - 0.5) * 2 * archetype.volatility;
      let actualVal = archetype.baseMW * (diurnalFactor + subHarmonic) * (1 + randomNoiseActual);
      actualVal = Math.max(0, Math.round(actualVal * 10) / 10);

      // Check for zero calm wind event
      if (day === 8 && sp >= 20 && sp <= 22) {
        actualVal = 0.0; // Genuine zero generation event
      }

      // Forecast generation value:
      // Includes systematic day-ahead model bias + meteorological timing phase error
      const forecastNoise = (rand() - 0.48) * 1.8 * archetype.volatility;
      const rampPhaseLag = Math.sin((sp / 48) * 4 * Math.PI) * 400;
      let forecastVal = actualVal + archetype.forecastBias + rampPhaseLag + forecastNoise * archetype.baseMW * 0.7;
      forecastVal = Math.max(0, Math.round(forecastVal * 10) / 10);

      // Check if this interval is an intended missing actual observation
      const isMissingWindow = missingWindows.find(
        (w) => w.day === day && sp >= w.startSP && sp <= w.endSP
      );

      // Check if record is unmatched (simulate 2 boundary intervals)
      const isUnmatched = (day === 1 && sp === 1) || (day === 31 && sp === 48);

      let actualOutput = actualVal;
      let isMissingActual = false;
      let dataQualityNote = null;

      if (isMissingWindow) {
        actualOutput = null;
        isMissingActual = true;
        dataQualityNote = isMissingWindow.reason;
      } else if (isUnmatched) {
        // Unmatched: forecast present, but excluded from day-ahead matching cutoff
        actualOutput = null;
        dataQualityNote = 'Excluded: Published after day-ahead cutoff or boundary interval';
      }

      // Signed error & Absolute error only calculated when both are non-null
      let signedError = null;
      let absoluteError = null;
      if (actualOutput !== null && forecastVal !== null) {
        signedError = Math.round((forecastVal - actualOutput) * 10) / 10;
        absoluteError = Math.round(Math.abs(signedError) * 10) / 10;
      }

      records.push({
        id: `WIND-202601-${recordIdCounter++}`,
        dateString: dateStr,
        settlementPeriod: sp,
        deliveryStartTime,
        deliveryEndTime,
        forecastPublicationTime: dayAheadPubTimeStr,
        decisionCutoff: 'Day-Ahead 17:00 Gate',
        fuelType: 'WIND',
        forecastGeneration: forecastVal,
        actualGeneration: actualOutput,
        signedError,
        absoluteError,
        isMissingActual,
        isUnmatched,
        isGenuineZero: actualOutput === 0,
        qualityNote: dataQualityNote,
      });
    }
  }

  return records;
}

// Pre-computed demonstration dataset
export const mockWindRecords = generateMockWindData();

// Dataset metadata for transparency
export const mockDatasetMetadata = {
  dataSource: 'Demonstration synthetic model simulating Elexon BMRS WINDFOR & FUELHH',
  periodStart: '2026-01-01T00:00:00Z',
  periodEnd: '2026-01-31T23:30:00Z',
  totalSettlementPeriods: 1488,
  settlementResolutionMinutes: 30,
  plannedMissingObservations: 14,
  unmatchedRecords: 2,
  isDemonstrationData: true,
  targetMarket: 'UK Electricity Market (NGET / Elexon BSC)',
  version: '1.0.0-frontend-preview',
};
