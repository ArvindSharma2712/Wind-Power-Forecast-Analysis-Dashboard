import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  ReferenceLine,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { formatMW, formatSignedError } from '../../utils/formatters';
import { formatUKDateTime } from '../../utils/dateUtils';
import { Info } from 'lucide-react';

const CustomErrorTooltip = ({ active, payload, errorMode }) => {
  if (!active || !payload || !payload.length) return null;
  const dataPoint = payload[0]?.payload;
  if (!dataPoint) return null;

  const signedErr = dataPoint.signedError;
  const absErr = dataPoint.absoluteError;

  return (
    <div className="bg-white dark:bg-slate-900 p-3 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 text-xs min-w-48 z-50 text-slate-800 dark:text-slate-200">
      <div className="font-semibold text-slate-800 dark:text-white pb-1 border-b border-slate-100 dark:border-slate-800">
        {formatUKDateTime(dataPoint.timestamp)}
      </div>
      <div className="mt-2 space-y-1">
        <div className="flex justify-between">
          <span className="text-slate-500 dark:text-slate-400">Signed Error (F − A):</span>
          <span
            className={`font-mono font-bold ${
              signedErr > 0 ? 'text-rose-600 dark:text-rose-400' : signedErr < 0 ? 'text-sky-600 dark:text-sky-400' : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            {formatSignedError(signedErr)} MW
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500 dark:text-slate-400">Absolute Error |F − A|:</span>
          <span className="font-mono font-bold text-slate-900 dark:text-white">
            {formatMW(absErr)} MW
          </span>
        </div>
        <div className="pt-1 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
          {signedErr > 0
            ? '▲ Overforecast: Potential excess contracted'
            : signedErr < 0
            ? '▼ Underforecast: Potential balancing purchase required'
            : 'Exact match'}
        </div>
      </div>
    </div>
  );
};

export function ForecastErrorChart({ data = [] }) {
  const [errorMode, setErrorMode] = useState('signed'); // 'signed' or 'absolute'

  // Filter to points with valid error calculation
  const validPoints = data.filter((d) => d.signedError !== null && d.signedError !== undefined);

  if (validPoints.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Forecast Error Tracking
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
              ({errorMode === 'signed' ? 'Signed Error e_i = F − A' : 'Absolute Error |F − A|'})
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Quantifying forecast deviation across delivery intervals to assess over/under purchasing exposure
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs self-start sm:self-auto border border-transparent dark:border-slate-700">
          <button
            type="button"
            onClick={() => setErrorMode('signed')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              errorMode === 'signed'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Signed Error (F − A)
          </button>
          <button
            type="button"
            onClick={() => setErrorMode('absolute')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              errorMode === 'absolute'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Absolute Error |F − A|
          </button>
        </div>
      </div>

      {/* Explanatory Definition Box */}
      <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-850 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-750 rounded-lg text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
        <Info className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p>
            <strong>Signed Error (F − A):</strong> Reflects directionality. A positive value (red) indicates the forecast exceeded actual wind generation (overforecast), risking an energy deficit where extra power must be procured. A negative value (blue) indicates actual wind generation exceeded forecast (underforecast).
          </p>
          <p>
            <strong>Absolute Error |F − A|:</strong> Measures the sheer magnitude of error without canceling out positive and negative deviations. This forms the basis for MAE.
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={validPoints}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#64748b" opacity={0.2} />
            <XAxis
              dataKey="label"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              minTickGap={40}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              unit=" MW"
              tickFormatter={(v) => (Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
            />
            <Tooltip content={<CustomErrorTooltip errorMode={errorMode} />} />
            {errorMode === 'signed' && (
              <ReferenceLine y={0} stroke="#64748b" strokeWidth={1.5} />
            )}
            <Bar
              dataKey={errorMode === 'signed' ? 'signedError' : 'absoluteError'}
              name={errorMode === 'signed' ? 'Signed Error (MW)' : 'Absolute Error (MW)'}
            >
              {validPoints.map((entry, index) => {
                let color = '#0d9488'; // Teal
                if (errorMode === 'signed') {
                  color = entry.signedError > 0 ? '#ef4444' : '#0284c7';
                }
                return <Cell key={`cell-${index}`} fill={color} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
