import React, { useState, useEffect, useCallback } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  Target,
  Activity,
  Compass,
  AlertTriangle,
  Info,
  BookOpen,
  Calendar,
  Layers,
} from 'lucide-react';
import { DateRangeFilter } from '../components/common/DateRangeFilter';
import { MetricCard } from '../components/dashboard/MetricCard';
import { ErrorTable } from '../components/tables/ErrorTable';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { analyticsService } from '../services/analyticsService';
import { formatMW, formatSignedError, formatPercent } from '../utils/formatters';
import { formatShortDate } from '../utils/dateUtils';

export function AccuracyAnalysis({
  startDate,
  endDate,
  onDateChange,
  refreshTrigger,
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyticsService.getAnalysisMetrics({ startDate, endDate });
      setAnalysisData(result);
    } catch (err) {
      console.error('Failed to load accuracy analysis', err);
      setError('Unable to compute forecast accuracy analytics.');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, refreshTrigger]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (error) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  const overall = analysisData?.overall;
  const daily = analysisData?.daily || [];
  const distribution = analysisData?.distribution || [];
  const diurnal = analysisData?.diurnal || [];
  const significantErrors = analysisData?.significantErrors || [];

  return (
    <div className="space-y-6">
      {/* Date Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors">
        <DateRangeFilter
          startDate={startDate}
          endDate={endDate}
          onDateChange={onDateChange}
        />
      </div>

      {/* Mandatory Day-Ahead Decision Cutoff Methodology Notice */}
      <div className="p-4 bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-xl text-xs text-teal-950 dark:text-teal-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 transition-colors">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-teal-950 dark:text-teal-200 text-sm">
              Day-Ahead Decision Cutoff Methodology
            </h4>
            <p className="mt-0.5 text-teal-900 dark:text-teal-300/90 leading-relaxed max-w-4xl">
              An electricity utility executes day-ahead procurement before the delivery day.
              Comparing actual generation against an arbitrary late forecast introduces lookahead bias.
              The backend evaluation algorithm strictly selects the latest available WINDFOR forecast
              published <strong>on or before the applicable day-ahead cutoff (17:00 GMT on D-1)</strong>.
              Unmatched records and missing observations are isolated and excluded from error totals.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Computing statistical error distributions & MAE profiles..." />
      ) : !overall || overall.n === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors">
          No matched forecast intervals found for this date range.
        </div>
      ) : (
        <>
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Mean Absolute Error (MAE)"
              value={formatMW(overall.mae)}
              unit="MW"
              icon={Target}
              accentColor="teal"
              tooltip="Measures average absolute magnitude of forecast deviation: (1/n) * sum(|F_i - A_i|)"
              subtitle={`${formatPercent(overall.normalizedMaePercent)} of mean output`}
              badge="Standard Metric"
              badgeType="info"
            />

            <MetricCard
              title="Root Mean Squared Error (RMSE)"
              value={formatMW(overall.rmse)}
              unit="MW"
              icon={Activity}
              accentColor="teal"
              tooltip="Penalizes larger errors disproportionately: sqrt((1/n) * sum((F_i - A_i)^2))"
              subtitle="Higher sensitivity to storm ramps"
            />

            <MetricCard
              title="Mean Signed Error (Bias)"
              value={formatSignedError(overall.meanSignedError)}
              unit="MW"
              icon={Compass}
              accentColor={overall.meanSignedError > 0 ? 'rose' : 'blue'}
              tooltip="Systematic directional bias: (1/n) * sum(F_i - A_i). Positive = overforecast; Negative = underforecast."
              subtitle={overall.meanSignedError > 0 ? 'Systematic overforecast' : 'Systematic underforecast'}
              badge={overall.meanSignedError > 0 ? 'Excess Position' : 'Short Position'}
              badgeType={overall.meanSignedError > 0 ? 'warning' : 'info'}
            />

            <MetricCard
              title="Maximum Absolute Error"
              value={formatMW(overall.maxAbsoluteError)}
              unit="MW"
              icon={AlertTriangle}
              accentColor="rose"
              tooltip="Largest recorded single interval error between day-ahead forecast and actual generation"
              subtitle="Peak extreme deviation"
              badge="Worst Interval"
              badgeType="rose"
            />
          </div>

          {/* Mathematical Definitions Card */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Error Formulation & Evaluation Standard
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800 transition-colors">
                <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1">Signed Error (e_i)</span>
                <code className="text-slate-800 dark:text-teal-300 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 block mb-2 font-mono">
                  e_i = F_i − A_i
                </code>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Identifies systematic operational bias. Positive values indicate the forecast over-estimated actual generation; negative values indicate an under-estimate.
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800 transition-colors">
                <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1">Mean Absolute Error (MAE)</span>
                <code className="text-slate-800 dark:text-teal-300 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 block mb-2 font-mono">
                  MAE = (1/n) * Σ |F_i − A_i|
                </code>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  The standard linear measure of average forecast accuracy, weighting all MW errors proportionally regardless of direction.
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800 transition-colors">
                <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1">Root Mean Squared Error (RMSE)</span>
                <code className="text-slate-800 dark:text-teal-300 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 block mb-2 font-mono">
                  RMSE = √[(1/n) * Σ (F_i − A_i)²]
                </code>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Disproportionately penalizes large magnitude forecast errors caused by rapid storm ramps or unexpected front delays.
                </p>
              </div>
            </div>
          </div>

          {/* Daily MAE & RMSE Comparison Chart */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Daily Forecast Error Comparison (January 2026)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Comparison of daily MAE versus RMSE across all 48 settlement periods per calendar day
                </p>
              </div>
            </div>

            <div className="w-full h-72 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={daily}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                  <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(d) => d.slice(8)} // Day number
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    unit=" MW"
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                    itemStyle={{ color: '#f8fafc' }}
                    formatter={(val, name) => [`${formatMW(val)} MW`, name]}
                    labelFormatter={(d) => `Date: ${formatShortDate(d)}`}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                  <Bar
                    dataKey="mae"
                    name="Daily MAE (MW)"
                    fill="#0d9488"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="rmse"
                    name="Daily RMSE (MW)"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Error Distribution & Diurnal Profile (2 Column) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* 1. Signed Error Histogram */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Signed Error Distribution (Histogram)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Frequency distribution of (Forecast − Actual) to identify skewness
                </p>
              </div>

              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={distribution}
                    margin={{ top: 10, right: 10, left: -10, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                    <XAxis
                      dataKey="label"
                      stroke="#94a3b8"
                      fontSize={10}
                      tickLine={false}
                      angle={-25}
                      textAnchor="end"
                      height={40}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      unit=" intervals"
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                      itemStyle={{ color: '#f8fafc' }}
                      formatter={(val, name, props) => [
                        `${val} intervals (${formatPercent(props.payload.percentage)})`,
                        'Frequency',
                      ]}
                    />
                    <Bar dataKey="count" name="Settlement Intervals">
                      {distribution.map((entry, index) => {
                        const isOver = entry.min >= 0;
                        return (
                          <Cell
                            key={`hist-${index}`}
                            fill={isOver ? '#ef4444' : '#0284c7'}
                          />
                        );
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-2 flex items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-sky-600"></span>
                  <span>Underforecasting (F &lt; A)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-rose-600"></span>
                  <span>Overforecasting (F &gt; A)</span>
                </div>
              </div>
            </div>

            {/* 2. Diurnal Error Profile (Settlement Periods 1-48) */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Diurnal Error Profile (SP 1–48)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Mean Absolute Error variation by time of day across 48 settlement periods
                </p>
              </div>

              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={diurnal}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                    <XAxis
                      dataKey="timeLabel"
                      stroke="#94a3b8"
                      fontSize={10}
                      tickLine={false}
                      interval={5}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      unit=" MW"
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                      itemStyle={{ color: '#f8fafc' }}
                      formatter={(val) => [`${formatMW(val)} MW`, 'Avg MAE']}
                      labelFormatter={(lbl, p) => `Time: ${lbl} (SP ${p[0]?.payload?.settlementPeriod})`}
                    />
                    <Line
                      type="monotone"
                      dataKey="mae"
                      name="Mean Absolute Error"
                      stroke="#0d9488"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">
                Reveals whether forecast error peaks during morning/evening thermal transitions
              </p>
            </div>
          </div>

          {/* Significant Forecast Errors Table */}
          <ErrorTable errors={significantErrors} />
        </>
      )}
    </div>
  );
}
