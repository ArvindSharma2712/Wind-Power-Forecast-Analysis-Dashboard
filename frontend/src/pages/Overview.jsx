import React, { useState, useEffect, useCallback } from 'react';
import {
  Wind,
  Zap,
  Target,
  Activity,
  Compass,
  CheckCircle2,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { MetricCard } from '../components/dashboard/MetricCard';
import { GenerationChart } from '../components/dashboard/GenerationChart';
import { ForecastErrorChart } from '../components/dashboard/ForecastErrorChart';
import { DataSummary } from '../components/dashboard/DataSummary';
import { DateRangeFilter } from '../components/common/DateRangeFilter';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { analyticsService } from '../services/analyticsService';
import { formatMW, formatSignedError, formatPercent } from '../utils/formatters';

export function Overview({
  startDate,
  endDate,
  onDateChange,
  refreshTrigger,
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metricsData, setMetricsData] = useState(null);
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [aggregation, setAggregation] = useState('30min');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [analysisResult, tsResult] = await Promise.all([
        analyticsService.getAnalysisMetrics({ startDate, endDate }),
        analyticsService.getTimeSeriesData({ startDate, endDate, aggregation }),
      ]);
      setMetricsData(analysisResult);
      setTimeSeriesData(tsResult);
    } catch (err) {
      console.error('Failed to load overview data', err);
      setError('Unable to calculate wind generation metrics for the selected period.');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, aggregation, refreshTrigger]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAggregationChange = async (newAgg) => {
    setAggregation(newAgg);
    try {
      const tsResult = await analyticsService.getTimeSeriesData({
        startDate,
        endDate,
        aggregation: newAgg,
      });
      setTimeSeriesData(tsResult);
    } catch (err) {
      console.error('Failed to aggregate time series', err);
    }
  };

  const handleResetFilters = () => {
    onDateChange('2026-01-01', '2026-01-31');
  };

  if (error) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  const overall = metricsData?.overall;

  return (
    <div className="space-y-6">
      {/* Date Filter & Period Control Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors">
        <DateRangeFilter
          startDate={startDate}
          endDate={endDate}
          onDateChange={onDateChange}
        />
      </div>

      {loading ? (
        <LoadingState message="Recalculating forecast analytics & error metrics for January 2026..." />
      ) : !overall || overall.n === 0 ? (
        <EmptyState
          title="No Matched Generation Intervals"
          description="There are no matched forecast and actual wind records for this specific date range."
          onReset={handleResetFilters}
        />
      ) : (
        <>
          {/* Key Metric KPI Cards (6 Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* 1. Average Forecast */}
            <MetricCard
              title="Avg Forecast"
              value={formatMW(overall.avgForecastMW)}
              unit="MW"
              icon={Wind}
              accentColor="blue"
              tooltip="Mean day-ahead wind power forecast across matched settlement intervals"
              subtitle="WINDFOR (D-1)"
            />

            {/* 2. Average Actual */}
            <MetricCard
              title="Avg Actual"
              value={formatMW(overall.avgActualMW)}
              unit="MW"
              icon={Zap}
              accentColor="amber"
              tooltip="Mean actual wind power delivered to the UK transmission grid"
              subtitle="FUELHH (Wind)"
            />

            {/* 3. MAE (Mean Absolute Error) */}
            <MetricCard
              title="MAE (Mean Error)"
              value={formatMW(overall.mae)}
              unit="MW"
              icon={Target}
              accentColor="teal"
              tooltip="Mean Absolute Error: average magnitude of forecast deviation without directional cancelation: (1/n) * sum(|F_i - A_i|)"
              subtitle={`${formatPercent(overall.normalizedMaePercent)} of avg gen`}
              badge="Standard Accuracy"
              badgeType="info"
            />

            {/* 4. RMSE (Root Mean Squared Error) */}
            <MetricCard
              title="RMSE (Root MSE)"
              value={formatMW(overall.rmse)}
              unit="MW"
              icon={Activity}
              accentColor="teal"
              tooltip="Root Mean Squared Error: penalizes large forecast outliers more severely than MAE: sqrt((1/n) * sum((F_i - A_i)^2))"
              subtitle="Penalizes extreme errors"
            />

            {/* 5. Mean Signed Error (Bias) */}
            <MetricCard
              title="Mean Signed Error"
              value={formatSignedError(overall.meanSignedError)}
              unit="MW"
              icon={Compass}
              accentColor={overall.meanSignedError > 0 ? 'rose' : 'blue'}
              tooltip="Mean Signed Error: (1/n) * sum(F_i - A_i). Positive indicates overforecasting; negative indicates underforecasting."
              subtitle={
                overall.meanSignedError > 0 ? 'Overforecast bias' : 'Underforecast bias'
              }
              badge={overall.meanSignedError > 0 ? 'Overforecast' : 'Underforecast'}
              badgeType={overall.meanSignedError > 0 ? 'warning' : 'info'}
            />

            {/* 6. Matched Interval Coverage */}
            <MetricCard
              title="Data Coverage"
              value={formatPercent(overall.coveragePercent)}
              unit=""
              icon={CheckCircle2}
              accentColor="teal"
              tooltip="Percentage of expected half-hour settlement periods with valid matched forecast and actual observations"
              subtitle={`${overall.n} / ${overall.expectedIntervals} intervals`}
              badge="Audit Clean"
              badgeType="success"
            />
          </div>

          {/* Main Time Series Chart: Forecast vs Actual */}
          <GenerationChart
            data={timeSeriesData}
            aggregation={aggregation}
            onAggregationChange={handleAggregationChange}
            isLoading={loading}
          />

          {/* Secondary Error Chart: Signed & Absolute Errors */}
          <ForecastErrorChart data={timeSeriesData} />

          {/* Data-Driven Summary & Extreme Days */}
          <DataSummary
            metrics={overall}
            bestDay={metricsData?.bestDay}
            worstDay={metricsData?.worstDay}
            startDate={startDate}
            endDate={endDate}
          />
        </>
      )}
    </div>
  );
}
