import React from 'react';
import { AlertTriangle, TrendingUp, Info } from 'lucide-react';
import { formatMW, formatSignedError, formatSettlementPeriod } from '../../utils/formatters';
import { formatUKDateTime } from '../../utils/dateUtils';
import { StatusBadge } from '../common/StatusBadge';

export function ErrorTable({ errors = [] }) {
  if (!errors || errors.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center text-xs text-slate-500 dark:text-slate-400">
        No significant forecast errors recorded for the selected window.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden transition-colors">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            Top 10 Peak Forecast Discrepancies
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Settlement intervals with the highest absolute deviation between Day-Ahead forecast and actual generation
          </p>
        </div>
        <span className="text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 px-2.5 py-1 rounded-md self-start sm:self-auto">
          High Balancing Risk
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="py-2.5 px-4">Rank</th>
              <th className="py-2.5 px-4">Delivery Interval</th>
              <th className="py-2.5 px-3">SP</th>
              <th className="py-2.5 px-4 text-right">Forecast (MW)</th>
              <th className="py-2.5 px-4 text-right">Actual (MW)</th>
              <th className="py-2.5 px-4 text-right">Signed Error (MW)</th>
              <th className="py-2.5 px-4 text-right">Absolute Error</th>
              <th className="py-2.5 px-4">Operational Implication</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
            {errors.map((item, idx) => {
              const rank = idx + 1;
              const isOver = (item.signedError || 0) > 0;

              return (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                  <td className="py-2.5 px-4 font-sans font-bold text-slate-900 dark:text-white">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs">
                      #{rank}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-sans font-medium text-slate-900 dark:text-white whitespace-nowrap">
                    {formatUKDateTime(item.deliveryStartTime)}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">
                      SP {item.settlementPeriod}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right font-bold text-blue-700 dark:text-blue-400 whitespace-nowrap">
                    {formatMW(item.forecastGeneration)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-bold text-amber-700 dark:text-amber-400 whitespace-nowrap">
                    {formatMW(item.actualGeneration)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-bold whitespace-nowrap">
                    <span className={isOver ? 'text-rose-600 dark:text-rose-400' : 'text-blue-600 dark:text-blue-400'}>
                      {formatSignedError(item.signedError)}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right font-bold text-rose-700 dark:text-rose-400 whitespace-nowrap">
                    {formatMW(item.absoluteError)} MW
                  </td>
                  <td className="py-2.5 px-4 font-sans text-xs whitespace-nowrap">
                    {isOver ? (
                      <span className="text-rose-700 dark:text-rose-400 flex items-center gap-1">
                        ▲ Overforecast: Potential short position in balancing market
                      </span>
                    ) : (
                      <span className="text-sky-700 dark:text-sky-400 flex items-center gap-1">
                        ▼ Underforecast: Potential surplus / spill risk
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
