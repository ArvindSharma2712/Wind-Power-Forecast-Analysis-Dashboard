import React from 'react';

/**
 * Reusable Status & Type Badge
 */
export function StatusBadge({ status, type = 'default', children, className = '' }) {
  // Determine color theme based on status or type
  let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';

  if (type === 'matched' || status === 'Matched' || status === 'Valid') {
    badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (type === 'missing' || status === 'Missing Actual' || status === 'Warning') {
    badgeStyle = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (type === 'unmatched' || status === 'Unmatched' || status === 'Info') {
    badgeStyle = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (type === 'error' || status === 'High Error' || status === 'Critical') {
    badgeStyle = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (type === 'zero' || status === 'Genuine Zero') {
    badgeStyle = 'bg-purple-50 text-purple-700 border-purple-200';
  } else if (type === 'demo' || status === 'Demonstration Data') {
    badgeStyle = 'bg-indigo-50 text-indigo-700 border-indigo-200';
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${badgeStyle} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-75"></span>
      {children || status}
    </span>
  );
}
