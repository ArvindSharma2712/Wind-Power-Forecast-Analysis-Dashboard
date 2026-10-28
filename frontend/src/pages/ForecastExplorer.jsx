import React, { useState, useEffect, useCallback } from 'react';
import { DateRangeFilter } from '../components/common/DateRangeFilter';
import { ForecastTable } from '../components/tables/ForecastTable';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { analyticsService } from '../services/analyticsService';
import { Info, HelpCircle } from 'lucide-react';

export function ForecastExplorer({
  startDate,
  endDate,
  onDateChange,
  refreshTrigger,
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 1 });
  const [sortBy, setSortBy] = useState('deliveryStartTime');
  const [sortOrder, setSortOrder] = useState('asc');
  const [search, setSearch] = useState('');
  const [settlementPeriod, setSettlementPeriod] = useState('all');
  const [errorFilter, setErrorFilter] = useState('all');

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyticsService.getForecastExplorerRecords({
        startDate,
        endDate,
        settlementPeriod,
        search,
        errorFilter,
        sortBy,
        sortOrder,
        page: pagination.page,
        pageSize: pagination.pageSize,
      });
      setRecords(result.records);
      setPagination(result.pagination);
    } catch (err) {
      console.error('Failed to load explorer records', err);
      setError('Unable to load settlement intervals. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [
    startDate,
    endDate,
    settlementPeriod,
    search,
    errorFilter,
    sortBy,
    sortOrder,
    pagination.page,
    pagination.pageSize,
    refreshTrigger,
  ]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const handleSortChange = (columnKey) => {
    if (sortBy === columnKey) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnKey);
      setSortOrder('asc');
    }
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newSize) => {
    setPagination((prev) => ({ ...prev, pageSize: newSize, page: 1 }));
  };

  const handleReset = () => {
    setSearch('');
    setSettlementPeriod('all');
    setErrorFilter('all');
    onDateChange('2026-01-01', '2026-01-31');
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <div className="space-y-6">
      {/* Date Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors">
        <DateRangeFilter
          startDate={startDate}
          endDate={endDate}
          onDateChange={(s, e) => {
            onDateChange(s, e);
            setPagination((prev) => ({ ...prev, page: 1 }));
          }}
        />
      </div>

      {/* Explanatory Banner: Timing Distinction */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs text-xs text-slate-600 dark:text-slate-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-400 flex items-center justify-center shrink-0">
            <Info className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="font-semibold text-slate-900 dark:text-white">
              Settlement Interval Timing Architecture
            </h4>
            <p className="leading-relaxed">
              <strong>Delivery Time:</strong> The 30-minute target settlement interval during which electricity is generated and consumed.{' '}
              <strong>Publication Time:</strong> The exact timestamp when Elexon published the forecast. For Day-Ahead purchase evaluation, only forecasts published prior to the gate closure cutoff are valid.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
          <div className="text-right">
            <div className="text-[11px] text-slate-400 dark:text-slate-500">Total Filtered Intervals</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">{pagination.total} Records</div>
          </div>
        </div>
      </div>

      {/* Main Table or Loading/Error State */}
      {error ? (
        <ErrorState message={error} onRetry={loadRecords} />
      ) : loading ? (
        <LoadingState message="Fetching settlement interval records..." />
      ) : records.length === 0 ? (
        <EmptyState
          title="No Matching Settlement Records"
          description="Try broadening your search term or clearing the error filter."
          onReset={handleReset}
        />
      ) : (
        <ForecastTable
          records={records}
          pagination={pagination}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          search={search}
          onSearchChange={(val) => {
            setSearch(val);
            setPagination((prev) => ({ ...prev, page: 1 }));
          }}
          settlementPeriod={settlementPeriod}
          onSettlementPeriodChange={(sp) => {
            setSettlementPeriod(sp);
            setPagination((prev) => ({ ...prev, page: 1 }));
          }}
          errorFilter={errorFilter}
          onErrorFilterChange={(ef) => {
            setErrorFilter(ef);
            setPagination((prev) => ({ ...prev, page: 1 }));
          }}
          isLoading={loading}
        />
      )}
    </div>
  );
}
