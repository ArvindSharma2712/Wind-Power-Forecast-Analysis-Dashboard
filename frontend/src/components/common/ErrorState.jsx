import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export function ErrorState({
  title = 'Data Processing Error',
  message = 'An unexpected error occurred while calculating wind forecast metrics.',
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center bg-rose-50/50 rounded-xl border border-rose-200">
      <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mb-3">
        <AlertCircle className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-semibold text-rose-900">{title}</h3>
      <p className="text-xs text-rose-700 max-w-md mt-1 mb-4">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-colors shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry Request
        </button>
      )}
    </div>
  );
}
