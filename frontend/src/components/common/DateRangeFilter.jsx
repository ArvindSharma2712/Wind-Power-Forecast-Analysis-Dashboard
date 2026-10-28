import React from 'react';
import { Calendar, Filter } from 'lucide-react';

const PRESETS = [
  { label: 'Full Month (Jan 1–31)', start: '2026-01-01', end: '2026-01-31' },
  { label: 'Week 1 (Jan 1–7)', start: '2026-01-01', end: '2026-01-07' },
  { label: 'Calm Period (Jan 6–9)', start: '2026-01-06', end: '2026-01-09' },
  { label: 'Storm Event (Jan 11–17)', start: '2026-01-11', end: '2026-01-17' },
  { label: 'Late Jan (Jan 22–31)', start: '2026-01-22', end: '2026-01-31' },
];

export function DateRangeFilter({
  startDate,
  endDate,
  onDateChange,
  className = '',
}) {
  const isPresetActive = (p) => p.start === startDate && p.end === endDate;

  return (
    <div className={`flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2.5 ${className}`}>
      {/* Preset Pills */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
          <Filter className="w-3 h-3 text-slate-400 dark:text-slate-500" />
          Range:
        </span>
        {PRESETS.map((preset) => {
          const active = isPresetActive(preset);
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => onDateChange(preset.start, preset.end)}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                active
                  ? 'bg-teal-700 dark:bg-teal-600 text-white shadow-xs font-semibold'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* Explicit Custom Date Inputs */}
      <div className="flex items-center gap-1.5 ml-auto text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-md shadow-2xs">
        <Calendar className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
        <span className="text-slate-400 dark:text-slate-500">From</span>
        <input
          type="date"
          min="2026-01-01"
          max="2026-01-31"
          value={startDate}
          onChange={(e) => onDateChange(e.target.value, endDate)}
          className="text-xs font-medium text-slate-700 dark:text-slate-200 bg-transparent border-none focus:outline-hidden focus:ring-0 cursor-pointer p-0"
        />
        <span className="text-slate-400 dark:text-slate-500">to</span>
        <input
          type="date"
          min="2026-01-01"
          max="2026-01-31"
          value={endDate}
          onChange={(e) => onDateChange(startDate, e.target.value)}
          className="text-xs font-medium text-slate-700 dark:text-slate-200 bg-transparent border-none focus:outline-hidden focus:ring-0 cursor-pointer p-0"
        />
      </div>
    </div>
  );
}
