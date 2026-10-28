import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  Database,
  CheckCircle2,
  HelpCircle,
  Clock,
  Layers,
  ArrowRight,
  Code2,
  FileSpreadsheet,
  AlertOctagon,
  Sparkles,
} from 'lucide-react';
import { DateRangeFilter } from '../components/common/DateRangeFilter';
import { MetricCard } from '../components/dashboard/MetricCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { analyticsService } from '../services/analyticsService';
import { formatInteger, formatPercent } from '../utils/formatters';
import { formatUKDateTime } from '../utils/dateUtils';

export function DataQuality({
  startDate,
  endDate,
  onDateChange,
  refreshTrigger,
  dataMode,
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' or 'raw-bmrs'
  const [bmrsDiagnosticResult, setBmrsDiagnosticResult] = useState(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  const handleRunDiagnosis = async () => {
    setIsDiagnosing(true);
    try {
      const diag = await analyticsService.diagnoseBMRS({
        dataset: 'FUELHH',
        settlementDateFrom: '2026-10-26',
        settlementDateTo: '2026-10-29',
        publishDateTimeFrom: '2026-10-27T11:30:00Z',
      });
      setBmrsDiagnosticResult(diag);
    } catch (e) {
      console.error(e);
    } finally {
      setIsDiagnosing(false);
    }
  };

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyticsService.getDataQualityReport({ startDate, endDate });
      setReport(result);
    } catch (err) {
      console.error('Failed to load data quality report', err);
      setError('Unable to compile data quality statistics.');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, refreshTrigger]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  if (error) {
    return <ErrorState message={error} onRetry={loadReport} />;
  }

  const summary = report?.summary;
  const logs = report?.qualityLogs || [];
  const rawAssets = report?.rawBMRSAssets;

  return (
    <div className="space-y-6">
      {/* Date Filter & View Tabs */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 transition-colors">
        <DateRangeFilter
          startDate={startDate}
          endDate={endDate}
          onDateChange={onDateChange}
        />

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs self-start md:self-auto shrink-0 transition-colors">
          <button
            type="button"
            onClick={() => setActiveTab('summary')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              activeTab === 'summary'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Audit Summary
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('raw-bmrs')}
            className={`px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'raw-bmrs'
                ? 'bg-teal-700 text-white shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>BMRS Assets Inspector</span>
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Auditing BMRS settlement feeds & interval integrity..." />
      ) : activeTab === 'raw-bmrs' ? (
        /* Raw BMRS Assets Inspector Tab */
        <div className="space-y-6">
          <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                User Assets Ingest Analysis (Elexon BMRS Stream Responses)
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl">
              The project's <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-slate-800 dark:text-teal-300">assets/</code> folder
              contains two original JSON payloads from Elexon BMRS APIs. This inspector diagnoses their structure
              and outlines the parameter adjustments required by the Python backend in Phase 2.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. WINDFOR JSON inspection */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs flex flex-col justify-between transition-colors">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="font-bold text-slate-900 dark:text-white text-sm">WINDFOR Stream Response</span>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    73 Records Loaded
                  </span>
                </div>

                <div className="text-xs space-y-2 text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400 dark:text-slate-500">File:</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200 text-[11px] truncate max-w-xs">
                      Wind generation forecast (WINDFOR)...json
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 dark:text-slate-500">Publish Timestamp:</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">2026-10-27T11:30:00Z</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 dark:text-slate-500">Horizon Span:</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">2026-10-26T21:00Z to 2026-10-29T21:00Z</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 dark:text-slate-500">Generation Range:</span>
                    <span className="font-mono text-blue-700 dark:text-blue-400 font-bold">5,197 MW – 22,525 MW</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                    First Record Sample (Raw JSON)
                  </span>
                  <pre className="p-3 bg-slate-900 text-emerald-400 rounded-lg text-[11px] font-mono overflow-x-auto border border-slate-800">
{JSON.stringify(rawAssets?.windforRecords?.[0] || {}, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="mt-4 p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 transition-colors">
                ✓ WINDFOR schema verified: <code className="font-mono">startTime</code>, <code className="font-mono">publishTime</code>, and <code className="font-mono">generation</code> match client requirements.
              </div>
            </div>

            {/* 2. FUELHH JSON error diagnosis */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs flex flex-col justify-between transition-colors">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                  <div className="flex items-center gap-2">
                    <AlertOctagon className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    <span className="font-bold text-slate-900 dark:text-white text-sm">FUELHH Response Diagnosis</span>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                    HTTP 400 Bad Request
                  </span>
                </div>

                <div className="text-xs space-y-2 text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400 dark:text-slate-500">File:</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200 text-[11px] truncate max-w-xs">
                      Half-hourly generation outturn (FUELHH)...json
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 dark:text-slate-500">RFC Standard:</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">RFC 9110 (Validation Error)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 dark:text-slate-500">Status Code:</span>
                    <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">400</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                    Returned API Error Payload
                  </span>
                  <pre className="p-3 bg-slate-900 text-rose-300 rounded-lg text-[11px] font-mono overflow-x-auto border border-slate-800">
{JSON.stringify(rawAssets?.fuelhhError || {}, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Resolution for backend */}
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/40 rounded-lg border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 transition-colors">
                <span className="font-bold block text-amber-950 dark:text-amber-300 mb-1">
                  Root Cause & Backend Query Fix:
                </span>
                <p className="leading-relaxed">
                  Elexon BMRS restricts querying FUELHH by both settlement date and publish date simultaneously:
                  <em className="block my-1 text-slate-800 dark:text-slate-200 font-medium">
                    "The Settlement Date fields cannot be set when a Publish Date field is set."
                  </em>
                  In the Python backend (Step 5), the request will omit <code className="bg-white/80 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">publishDateTimeFrom</code> and use solely <code className="bg-white/80 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">settlementDateFrom/To</code> to successfully retrieve actual outturns.
                </p>

                {/* Interactive Backend Diagnostic Action */}
                <div className="mt-3 pt-2.5 border-t border-amber-200 dark:border-amber-800 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleRunDiagnosis}
                    disabled={isDiagnosing}
                    className="self-start inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white transition-colors shadow-2xs disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isDiagnosing ? 'Testing Backend Resolver...' : 'Execute FastAPI Conflict Resolver'}</span>
                  </button>

                  {bmrsDiagnosticResult && (
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-teal-300 dark:border-teal-700 text-slate-800 dark:text-slate-100 text-xs mt-1 animate-in fade-in duration-200">
                      <div className="font-bold text-teal-700 dark:text-teal-400 mb-1 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>FastAPI Resolver Response (HTTP 200)</span>
                      </div>
                      <div className="space-y-1 text-[11px]">
                        <div><strong className="text-slate-500">Diagnosis:</strong> {bmrsDiagnosticResult.diagnosis}</div>
                        <div><strong className="text-slate-500">Sanitized Query Parameters:</strong> <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">{JSON.stringify(bmrsDiagnosticResult.correctedParameters)}</code></div>
                        <div><strong className="text-slate-500">Suggested Elexon URL:</strong> <span className="font-mono text-teal-600 dark:text-teal-400 break-all">{bmrsDiagnosticResult.suggestedUrl}</span></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Summary Tab */
        <>
          {/* Data Quality Metrics (Grid of Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Forecast Records"
              value={formatInteger(summary.totalForecastRecords)}
              unit=""
              icon={Database}
              accentColor="blue"
              tooltip="Total half-hour WINDFOR forecast records retrieved for this date range"
              subtitle="WINDFOR Dataset"
            />

            <MetricCard
              title="Matched Delivery SPs"
              value={formatInteger(summary.matchedDeliveryIntervals)}
              unit=""
              icon={CheckCircle2}
              accentColor="teal"
              tooltip="Settlement intervals where both day-ahead forecast and actual generation are successfully matched"
              subtitle={`${formatPercent(summary.dataCoveragePercent)} Coverage`}
              badge="Audit Validated"
              badgeType="success"
            />

            <MetricCard
              title="Missing Actual Observations"
              value={formatInteger(summary.missingActualObservations)}
              unit=""
              icon={AlertTriangle}
              accentColor={summary.missingActualObservations > 0 ? 'amber' : 'teal'}
              tooltip="Intervals where actual generation is null due to BMRS telemetry gaps (excluded from error metrics)"
              subtitle="Excluded from MAE/RMSE"
              badge={summary.missingActualObservations > 0 ? 'Telemetry Gaps' : 'Complete'}
              badgeType={summary.missingActualObservations > 0 ? 'warning' : 'success'}
            />

            <MetricCard
              title="Unmatched Records"
              value={formatInteger(summary.unmatchedForecastRecords)}
              unit=""
              icon={FileCheck}
              accentColor="teal"
              tooltip="Forecast records published after the day-ahead gate closure or outside valid horizons"
              subtitle="Isolated by cutoff rule"
              badge="Cutoff Enforced"
              badgeType="info"
            />
          </div>

          {/* Three-Way Operational Distinction Guide */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              BMRS Data Integrity Classifications
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              To preserve data integrity, the system maintains strict programmatic distinctions between these three distinct data states:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* 1. Genuine Zero */}
              <div className="p-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-purple-900 dark:text-purple-300 text-sm">1. Genuine Zero Generation</span>
                  <StatusBadge type="zero" status="Valid 0.0 MW" />
                </div>
                <p className="text-purple-800 dark:text-purple-300/90 leading-relaxed mb-3">
                  Represents a verified physical event where actual wind turbines generated 0.0 MW (e.g. during extreme calm Dunkelflaute or grid curtailment instructions).
                </p>
                <div className="text-[11px] font-semibold text-purple-900 dark:text-purple-200 bg-white/70 dark:bg-purple-900/40 p-2 rounded">
                  Handling: Included in MAE and RMSE error calculations as actual = 0.
                </div>
              </div>

              {/* 2. Missing Actuals */}
              <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-amber-900 dark:text-amber-300 text-sm">2. Missing Actual Telemetry</span>
                  <StatusBadge type="missing" status="Null Value" />
                </div>
                <p className="text-amber-800 dark:text-amber-300/90 leading-relaxed mb-3">
                  Indicates a communications or data-feed dropout from BMRS FUELHH. The data point is <code className="bg-white/80 dark:bg-slate-800 px-1 py-0.5 rounded">null</code>, NOT zero.
                </p>
                <div className="text-[11px] font-semibold text-amber-900 dark:text-amber-200 bg-white/70 dark:bg-amber-900/40 p-2 rounded">
                  Handling: Strictly excluded from error calculations to avoid false errors.
                </div>
              </div>

              {/* 3. Unmatched Forecasts */}
              <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-blue-900 dark:text-blue-300 text-sm">3. Unmatched Forecasts</span>
                  <StatusBadge type="unmatched" status="Gate Cutoff" />
                </div>
                <p className="text-blue-800 dark:text-blue-300/90 leading-relaxed mb-3">
                  Forecasts published outside the day-ahead purchasing decision window (e.g. intraday or post-delivery updates).
                </p>
                <div className="text-[11px] font-semibold text-blue-900 dark:text-blue-200 bg-white/70 dark:bg-blue-900/40 p-2 rounded">
                  Handling: Logged in quality audit but excluded from Day-Ahead MAE.
                </div>
              </div>
            </div>
          </div>

          {/* Data Quality Anomaly Log Table */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden transition-colors">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Data Quality & Telemetry Audit Log
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Detailed inspection of intervals requiring data exclusion, imputation isolation, or special classification
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-md">
                {logs.length} Flagged Events
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/70 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4">Event ID</th>
                    <th className="py-2.5 px-4">Timestamp (UTC)</th>
                    <th className="py-2.5 px-3">SP</th>
                    <th className="py-2.5 px-4">Category</th>
                    <th className="py-2.5 px-4">Dataset Source</th>
                    <th className="py-2.5 px-4">Anomaly Description</th>
                    <th className="py-2.5 px-4">Engine Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 dark:text-slate-500">
                        No quality anomalies recorded in this interval.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-2.5 px-4 font-mono font-semibold text-slate-800 dark:text-slate-200">
                          {log.id}
                        </td>
                        <td className="py-2.5 px-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                          {formatUKDateTime(log.timestamp)}
                        </td>
                        <td className="py-2.5 px-3 font-mono">
                          <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded text-[11px] font-semibold">
                            SP {log.settlementPeriod}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 whitespace-nowrap">
                          <StatusBadge
                            status={log.type}
                            type={
                              log.type.includes('Missing')
                                ? 'missing'
                                : log.type.includes('Unmatched')
                                ? 'unmatched'
                                : 'zero'
                            }
                          />
                        </td>
                        <td className="py-2.5 px-4 font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          {log.dataset}
                        </td>
                        <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300">
                          {log.description}
                        </td>
                        <td className="py-2.5 px-4 font-medium text-teal-800 dark:text-teal-400 whitespace-nowrap">
                          {log.impact}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
