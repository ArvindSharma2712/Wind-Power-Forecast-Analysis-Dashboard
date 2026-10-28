import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { formatMW, formatSignedError } from '../../utils/formatters';
import { formatUKDateTime } from '../../utils/dateUtils';
import { AlertTriangle, Clock } from 'lucide-react';

// Custom tooltip renderer for high data fidelity
const CustomChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  const dataPoint = payload[0]?.payload;
  if (!dataPoint) return null;

  const forecast = dataPoint.forecast;
  const actual = dataPoint.actual;
  const isMissing = dataPoint.isMissingActual || actual === null;
  const isZero = actual === 0;

  return (
    <div className="bg-white dark:bg-slate-900 p-3.5 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 text-xs min-w-56 z-50 text-slate-800 dark:text-slate-200">
      <div className="font-semibold text-slate-800 dark:text-white pb-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <span>{formatUKDateTime(dataPoint.timestamp)}</span>
        {dataPoint.settlementPeriod && (
          <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">SP {dataPoint.settlementPeriod}</span>
        )}
      </div>

      <div className="mt-2 space-y-1.5">
        {/* Forecast */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400">
            <span className="w-2.5 h-2.5 rounded-xs bg-blue-600"></span>
            <span className="font-medium">Forecast (WINDFOR):</span>
          </div>
          <span className="font-mono font-bold text-slate-900 dark:text-white">
            {formatMW(forecast)} MW
          </span>
        </div>

        {/* Actual */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
            <span className="w-2.5 h-2.5 rounded-xs bg-amber-600"></span>
            <span className="font-medium">Actual (FUELHH):</span>
          </div>
          {isMissing ? (
            <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded text-[11px]">
              <AlertTriangle className="w-3 h-3" /> Missing Observation
            </span>
          ) : isZero ? (
            <span className="font-mono font-bold text-purple-700 dark:text-purple-400">
              0.0 MW (Zero Wind/Calm)
            </span>
          ) : (
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              {formatMW(actual)} MW
            </span>
          )}
        </div>

        {/* Error (only when both exist) */}
        {!isMissing && forecast !== null && actual !== null && (
          <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">Signed Error (F − A):</span>
            <span
              className={`font-mono font-semibold ${
                forecast - actual > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-blue-600 dark:text-blue-400'
              }`}
            >
              {formatSignedError(forecast - actual)} MW
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export function GenerationChart({
  data = [],
  aggregation = '30min',
  onAggregationChange,
  isLoading = false,
}) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">No time-series data available for the selected interval.</p>
      </div>
    );
  }

  // Count missing intervals for informational banner
  const missingCount = data.filter((d) => d.isMissingActual || d.actual === null).length;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs transition-colors">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Forecast versus Actual Wind Generation
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">(January 2026)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Comparison of Day-Ahead wind generation forecast against actual delivered generation
          </p>
        </div>

        {/* Aggregation Control Tabs */}
        {onAggregationChange && (
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs self-start sm:self-auto border border-transparent dark:border-slate-700">
            <button
              type="button"
              onClick={() => onAggregationChange('30min')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                aggregation === '30min'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              30-Min Interval
            </button>
            <button
              type="button"
              onClick={() => onAggregationChange('hourly')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                aggregation === 'hourly'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Hourly Average
            </button>
            <button
              type="button"
              onClick={() => onAggregationChange('daily')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                aggregation === 'daily'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Daily Average
            </button>
          </div>
        )}
      </div>

      {/* Missing data notification pill if present */}
      {missingCount > 0 && (
        <div className="mb-3 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              <strong>{missingCount} interval{missingCount > 1 ? 's' : ''}</strong> have missing actual observations
              (gaps in chart line). These are safely excluded from MAE and RMSE calculations and distinct from 0.0 MW.
            </span>
          </div>
        </div>
      )}

      {/* Main Chart Body */}
      <div className="w-full h-80 sm:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#64748b" opacity={0.2} />
            <XAxis
              dataKey="label"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={40}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              unit=" MW"
              tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
            />
            <Tooltip content={<CustomChartTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: 12, fontSize: 12 }}
            />
            {/* Forecast Line */}
            <Line
              type="monotone"
              dataKey="forecast"
              name="Forecast (WINDFOR)"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, stroke: '#1d4ed8', strokeWidth: 1 }}
              connectNulls={false}
            />
            {/* Actual Generation Line */}
            <Line
              type="monotone"
              dataKey="actual"
              name="Actual Generation (FUELHH)"
              stroke="#f59e0b"
              strokeWidth={2.2}
              dot={false}
              activeDot={{ r: 5, stroke: '#b45309', strokeWidth: 1.5 }}
              connectNulls={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Footer metadata */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-blue-500 rounded"></span>
            <span>Forecast: WINDFOR Day-Ahead Cutoff</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-amber-500 rounded"></span>
            <span>Actual: FUELHH Wind Generation</span>
          </div>
        </div>
        <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
          Resolution: {aggregation === '30min' ? '48 Settlement Periods / Day' : aggregation}
        </div>
      </div>
    </div>
  );
}
