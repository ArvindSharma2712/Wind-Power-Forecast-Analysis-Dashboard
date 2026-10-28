import React from 'react';
import {
  TrendingUp,
  Award,
  AlertOctagon,
  Calendar,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { formatMW, formatSignedError, formatPercent } from '../../utils/formatters';
import { formatShortDate } from '../../utils/dateUtils';

export function DataSummary({
  metrics,
  bestDay,
  worstDay,
  startDate,
  endDate,
}) {
  if (!metrics || metrics.n === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Dynamic Operational Summary */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs flex flex-col justify-between transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Wind Generation Synthesis ({formatShortDate(startDate)} – {formatShortDate(endDate)})
            </h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            During this analysis window, average wind generation delivered{' '}
            <strong className="text-slate-900 dark:text-white font-semibold">{formatMW(metrics.avgActualMW)} MW</strong> against a day-ahead
            average forecast of <strong className="text-slate-900 dark:text-white font-semibold">{formatMW(metrics.avgForecastMW)} MW</strong>.
            The aggregate Mean Absolute Error (MAE) stands at{' '}
            <strong className="text-teal-700 dark:text-teal-400 font-semibold">{formatMW(metrics.mae)} MW</strong> ({formatPercent(metrics.normalizedMaePercent)} of average generation).
          </p>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-750">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">Mean Forecast Bias</span>
              <span className={`text-sm font-bold ${metrics.meanSignedError > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-blue-600 dark:text-blue-400'}`}>
                {formatSignedError(metrics.meanSignedError)} MW
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">
                {metrics.meanSignedError > 0 ? 'Overforecasting tendency' : 'Underforecasting tendency'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-750">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">Peak Single Error</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {formatMW(metrics.maxAbsoluteError)} MW
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">Extreme interval deviation</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-750 col-span-2 sm:col-span-1">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">Data Coverage</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {formatPercent(metrics.coveragePercent)}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">
                {metrics.n} / {metrics.expectedIntervals} valid SPs
              </span>
            </div>
          </div>
        </div>

        {/* Client Scope Notice */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
          <span>
            <strong>Purchasing Scope Note:</strong> MAE and RMSE quantify forecast accuracy against actual generation.
            They do not directly prescribe the total volume of electricity to contract, as the utility's consumer demand profile is not provided in this dataset.
          </span>
        </div>
      </div>

      {/* Best & Worst Forecast Days */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs flex flex-col justify-between transition-colors">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            Performance Extremes
          </h3>

          <div className="space-y-3">
            {/* Best Day Card */}
            {bestDay ? (
              <div className="p-3 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-800 dark:text-emerald-300">
                    <Award className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Best Day (Lowest MAE)
                  </span>
                  <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                    {formatShortDate(bestDay.date)}
                  </span>
                </div>
                <div className="text-xs text-emerald-950 dark:text-emerald-200 flex justify-between items-baseline mt-1">
                  <span>Day MAE:</span>
                  <span className="font-mono font-bold text-emerald-800 dark:text-emerald-300">{formatMW(bestDay.mae)} MW</span>
                </div>
                <div className="text-[11px] text-emerald-700 dark:text-emerald-400 flex justify-between mt-0.5">
                  <span>Avg Gen: {formatMW(bestDay.avgActualMW)} MW</span>
                  <span>RMSE: {formatMW(bestDay.rmse)} MW</span>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs text-slate-500 text-center">
                Insufficient data to identify best day.
              </div>
            )}

            {/* Worst Day Card */}
            {worstDay ? (
              <div className="p-3 rounded-lg bg-rose-50/60 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="inline-flex items-center gap-1 font-semibold text-rose-800 dark:text-rose-300">
                    <AlertOctagon className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                    Worst Day (Highest MAE)
                  </span>
                  <span className="font-mono text-rose-700 dark:text-rose-400 font-bold">
                    {formatShortDate(worstDay.date)}
                  </span>
                </div>
                <div className="text-xs text-rose-950 dark:text-rose-200 flex justify-between items-baseline mt-1">
                  <span>Day MAE:</span>
                  <span className="font-mono font-bold text-rose-800 dark:text-rose-300">{formatMW(worstDay.mae)} MW</span>
                </div>
                <div className="text-[11px] text-rose-700 dark:text-rose-400 flex justify-between mt-0.5">
                  <span>Avg Gen: {formatMW(worstDay.avgActualMW)} MW</span>
                  <span>RMSE: {formatMW(worstDay.rmse)} MW</span>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs text-slate-500 text-center">
                Insufficient data to identify worst day.
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 pt-2 text-[11px] text-slate-600 dark:text-slate-400 text-center font-medium">
          Evaluated from 48 daily 30-min settlement periods
        </div>
      </div>
    </div>
  );
}
