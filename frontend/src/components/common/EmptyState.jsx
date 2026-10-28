import React from 'react';
import { Database, RotateCcw } from 'lucide-react';

export function EmptyState({
  title = 'No Records Found',
  description = 'No wind power forecast or generation intervals match the selected filters.',
  onReset,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-dashed border-slate-300">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mb-3">
        <Database className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md mt-1 mb-4">{description}</p>
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          Reset Filters to Full Month
        </button>
      )}
    </div>
  );
}
