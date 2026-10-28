import React from 'react';
import { HelpCircle } from 'lucide-react';

export function MetricCard({
  title,
  value,
  unit = 'MW',
  icon: Icon,
  tooltip,
  subtitle,
  badge,
  badgeType = 'default',
  accentColor = 'teal', // 'teal', 'blue', 'amber', 'rose'
}) {
  const accentClasses = {
    teal: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 border-teal-100 dark:border-teal-800',
    blue: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-100 dark:border-blue-800',
    amber: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-100 dark:border-amber-800',
    rose: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-100 dark:border-rose-800',
  };

  const badgeClasses = {
    default: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    success: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
    warning: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
    info: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
    rose: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800',
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
      <div>
        {/* Header row: title and icon */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-1.5 group relative">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {title}
            </span>
            {tooltip && (
              <span className="cursor-help text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" title={tooltip}>
                <HelpCircle className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
          {Icon && (
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${accentClasses[accentColor] || accentClasses.teal}`}>
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Metric value and unit */}
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {value !== null && value !== undefined ? value : '—'}
          </span>
          {unit && (
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              {unit}
            </span>
          )}
        </div>
      </div>

      {/* Subtitle & Badges */}
      {(subtitle || badge) && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="truncate pr-1">{subtitle}</span>
          {badge && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${badgeClasses[badgeType] || badgeClasses.default}`}>
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
