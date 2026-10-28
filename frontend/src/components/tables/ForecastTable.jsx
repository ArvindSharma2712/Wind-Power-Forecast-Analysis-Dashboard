import React, { useState } from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  AlertTriangle,
  Clock,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
} from 'lucide-react';
import { formatMW, formatSignedError, formatSettlementPeriod } from '../../utils/formatters';
import { formatUKDateTime, getLeadTimeHours } from '../../utils/dateUtils';
import { StatusBadge } from '../common/StatusBadge';

export function ForecastTable({
  records = [],
  pagination = { page: 1, pageSize: 20, total: 0, totalPages: 1 },
  onPageChange,
  onPageSizeChange,
  sortBy = 'deliveryStartTime',
  sortOrder = 'asc',
  onSortChange,
  search = '',
  onSearchChange,
  settlementPeriod = 'all',
  onSettlementPeriodChange,
  errorFilter = 'all',
  onErrorFilterChange,
  isLoading = false,
}) {
  const [downloading, setDownloading] = useState(false);

  // CSV Export utility
  const handleExportCSV = () => {
    setDownloading(true);
    try {
      const headers = [
        'Settlement_Period',
        'Delivery_Start_Time_UTC',
        'Delivery_End_Time_UTC',
        'Forecast_Publication_Time_UTC',
        'Decision_Cutoff',
        'Forecast_Generation_MW',
        'Actual_Generation_MW',
        'Signed_Error_MW',
        'Absolute_Error_MW',
        'Status',
        'Notes',
      ];

      const rows = records.map((r) => [
        r.settlementPeriod,
        r.deliveryStartTime,
        r.deliveryEndTime,
        r.forecastPublicationTime,
        r.decisionCutoff,
        r.forecastGeneration ?? '',
        r.actualGeneration ?? '',
        r.signedError ?? '',
        r.absoluteError ?? '',
        r.isMissingActual ? 'Missing Actual' : r.isUnmatched ? 'Unmatched' : 'Matched',
        r.qualityNote || '',
      ]);

      const csvContent =
        'data:text/csv;charset=utf-8,' +
        [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `WindInsight_Forecasts_Jan2026_Page${pagination.page}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('CSV export failed', err);
    } finally {
      setDownloading(false);
    }
  };

  const renderSortIcon = (columnKey) => {
    if (sortBy !== columnKey) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 ml-1 inline-block" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400 ml-1 inline-block" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400 ml-1 inline-block" />
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden flex flex-col transition-colors">
      {/* Table Filter Toolbar */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search date (e.g. 2026-01-14) or SP..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-teal-500 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
          />
        </div>

        {/* Filter dropdowns & Export */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Settlement Period Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Period:</span>
            <select
              value={settlementPeriod}
              onChange={(e) => onSettlementPeriodChange(e.target.value)}
              className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-teal-500"
            >
              <option value="all">All Periods (1–48)</option>
              {Array.from({ length: 48 }, (_, i) => i + 1).map((sp) => (
                <option key={sp} value={sp}>
                  {formatSettlementPeriod(sp)}
                </option>
              ))}
            </select>
          </div>

          {/* Error Severity Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Error:</span>
            <select
              value={errorFilter}
              onChange={(e) => onErrorFilterChange(e.target.value)}
              className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-teal-500"
            >
              <option value="all">All Discrepancies</option>
              <option value="high_error">High Error (≥ 1,500 MW)</option>
              <option value="moderate_error">Moderate (500–1,500 MW)</option>
              <option value="low_error">Low Error (&lt; 500 MW)</option>
              <option value="missing_actual">Missing Actuals Only</option>
            </select>
          </div>

          {/* Export Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={downloading || records.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-2xs disabled:opacity-50"
            title="Export filtered records as CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Critical Methodology Note banner */}
      <div className="px-4 py-2 bg-blue-50/70 dark:bg-blue-950/40 border-b border-blue-100 dark:border-blue-900/60 text-xs text-blue-900 dark:text-blue-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>
            <strong>Decision Cutoff Alignment:</strong> In day-ahead utility purchasing, forecasts are locked at the D-1 decision gate. The table reflects forecasts published before the delivery day.
          </span>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 select-none">
            <tr>
              <th
                onClick={() => onSortChange('deliveryStartTime')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white whitespace-nowrap"
              >
                Delivery Time (UTC) {renderSortIcon('deliveryStartTime')}
              </th>
              <th
                onClick={() => onSortChange('settlementPeriod')}
                className="py-3 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white whitespace-nowrap"
              >
                SP {renderSortIcon('settlementPeriod')}
              </th>
              <th className="py-3 px-4 whitespace-nowrap">
                Forecast Publication Time (D-1)
              </th>
              <th
                onClick={() => onSortChange('forecastGeneration')}
                className="py-3 px-4 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white whitespace-nowrap"
              >
                Forecast (MW) {renderSortIcon('forecastGeneration')}
              </th>
              <th
                onClick={() => onSortChange('actualGeneration')}
                className="py-3 px-4 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white whitespace-nowrap"
              >
                Actual (MW) {renderSortIcon('actualGeneration')}
              </th>
              <th
                onClick={() => onSortChange('signedError')}
                className="py-3 px-4 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white whitespace-nowrap"
              >
                Signed Error {renderSortIcon('signedError')}
              </th>
              <th
                onClick={() => onSortChange('absoluteError')}
                className="py-3 px-4 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white whitespace-nowrap"
              >
                |Error| {renderSortIcon('absoluteError')}
              </th>
              <th className="py-3 px-4 text-center whitespace-nowrap">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
            {records.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400 dark:text-slate-500 font-sans">
                  No forecast records matched the specified filters.
                </td>
              </tr>
            ) : (
              records.map((row) => {
                const leadHours = getLeadTimeHours(row.forecastPublicationTime, row.deliveryStartTime);
                const hasMissingActual = row.isMissingActual || row.actualGeneration === null;
                const isHighError = row.absoluteError !== null && row.absoluteError >= 1500;

                return (
                  <tr
                    key={row.id}
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors ${
                      hasMissingActual ? 'bg-amber-50/20 dark:bg-amber-950/20' : isHighError ? 'bg-rose-50/20 dark:bg-rose-950/20' : ''
                    }`}
                  >
                    {/* Delivery Time */}
                    <td className="py-2.5 px-4 font-sans font-medium text-slate-900 dark:text-white whitespace-nowrap">
                      {formatUKDateTime(row.deliveryStartTime)}
                    </td>

                    {/* Settlement Period */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">
                        SP {row.settlementPeriod}
                      </span>
                    </td>

                    {/* Publication Time */}
                    <td className="py-2.5 px-4 font-sans text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span>{formatUKDateTime(row.forecastPublicationTime)}</span>
                        {leadHours && (
                          <span className="text-[10px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded font-medium">
                            +{leadHours}h lead
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Forecast MW */}
                    <td className="py-2.5 px-4 text-right font-bold text-blue-700 dark:text-blue-400 whitespace-nowrap">
                      {formatMW(row.forecastGeneration)}
                    </td>

                    {/* Actual MW */}
                    <td className="py-2.5 px-4 text-right whitespace-nowrap">
                      {hasMissingActual ? (
                        <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-sans text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded">
                          <AlertTriangle className="w-3 h-3" /> Missing
                        </span>
                      ) : row.actualGeneration === 0 ? (
                        <span className="font-bold text-purple-700 dark:text-purple-400">0.0 (Zero)</span>
                      ) : (
                        <span className="font-bold text-amber-700 dark:text-amber-400">{formatMW(row.actualGeneration)}</span>
                      )}
                    </td>

                    {/* Signed Error */}
                    <td className="py-2.5 px-4 text-right whitespace-nowrap">
                      {row.signedError !== null ? (
                        <span
                          className={`font-semibold ${
                            row.signedError > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-blue-600 dark:text-blue-400'
                          }`}
                        >
                          {formatSignedError(row.signedError)}
                        </span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600 font-sans">—</span>
                      )}
                    </td>

                    {/* Absolute Error */}
                    <td className="py-2.5 px-4 text-right whitespace-nowrap">
                      {row.absoluteError !== null ? (
                        <span
                          className={`font-semibold ${
                            row.absoluteError >= 1500 ? 'text-rose-700 dark:text-rose-400 font-bold' : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {formatMW(row.absoluteError)}
                        </span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600 font-sans">—</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-2.5 px-4 text-center font-sans whitespace-nowrap">
                      {hasMissingActual ? (
                        <StatusBadge type="missing" status="Missing Actual" />
                      ) : row.isUnmatched ? (
                        <StatusBadge type="unmatched" status="Unmatched" />
                      ) : isHighError ? (
                        <StatusBadge type="error" status="High Error" />
                      ) : (
                        <StatusBadge type="matched" status="Matched" />
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span>
            Showing{' '}
            <strong className="text-slate-800 dark:text-white">
              {pagination.total > 0 ? (pagination.page - 1) * pagination.pageSize + 1 : 0}
            </strong>{' '}
            to{' '}
            <strong className="text-slate-800 dark:text-white">
              {Math.min(pagination.page * pagination.pageSize, pagination.total)}
            </strong>{' '}
            of <strong className="text-slate-800 dark:text-white">{pagination.total}</strong> settlement intervals
          </span>

          <span className="text-slate-300 dark:text-slate-700">|</span>

          {/* Page size selector */}
          <div className="flex items-center gap-1">
            <span>Per page:</span>
            <select
              value={pagination.pageSize}
              onChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-slate-700 dark:text-slate-300"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Page navigation buttons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="p-1 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 font-medium text-slate-700 dark:text-slate-300">
            Page {pagination.page} of {pagination.totalPages || 1}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="p-1 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
