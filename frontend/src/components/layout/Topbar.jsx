import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analyticsService';
import {
  Menu,
  RotateCw,
  Info,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Database,
  FileSpreadsheet,
  Moon,
  Sun,
  Home,
  Server,
} from 'lucide-react';

const VIEW_TITLES = {
  overview: {
    title: 'Renewable Generation Monitor',
    subtitle: 'Day-Ahead Wind Forecast vs Actual Generation',
  },
  'forecast-explorer': {
    title: 'Forecast Explorer',
    subtitle: 'Detailed Settlement Period (30-min) Delivery & Error Records',
  },
  'accuracy-analysis': {
    title: 'Forecast Accuracy Analysis',
    subtitle: 'Statistical Error Metrics (MAE, RMSE, Bias) & Temporal Profiles',
  },
  'data-quality': {
    title: 'Data Quality & BMRS Integrity',
    subtitle: 'Interval Coverage, Missing Actuals & Unmatched Forecast Auditing',
  },
  'about-project': {
    title: 'Project Architecture & Methodology',
    subtitle: 'UK Utility Day-Ahead Purchasing Workflow & Elexon BMRS Guidelines',
  },
};

export function Topbar({
  currentView,
  onOpenMobile,
  onRefresh,
  isRefreshing = false,
  dataMode = 'january-2026',
  onDataModeChange,
  onGoHome,
  onLogout,
  currentUser,
  darkMode = false,
  onToggleDarkMode,
}) {
  const [showDataNotice, setShowDataNotice] = useState(false);
  const [backendStatus, setBackendStatus] = useState({ connected: false, version: '2.0.0', pythonVersion: '', pandasVersion: '' });
  const viewInfo = VIEW_TITLES[currentView] || VIEW_TITLES.overview;

  useEffect(() => {
    let isMounted = true;
    const fetchHealth = async () => {
      try {
        const health = await analyticsService.getHealthStatus();
        if (isMounted) {
          setBackendStatus({
            connected: Boolean(health.backendConnected),
            version: health.version || '2.0.0',
            pythonVersion: health.pythonVersion || '3.13.6',
            pandasVersion: health.pandasVersion || '2.3.3',
          });
        }
      } catch (e) {
        if (isMounted) setBackendStatus((prev) => ({ ...prev, connected: false }));
      }
    };
    fetchHealth();
    const interval = setInterval(fetchHealth, 8000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isRefreshing]);

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3 transition-colors">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Page Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobile}
            className="p-2 -ml-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-teal-700 dark:text-teal-400 tracking-wide uppercase">
                WindInsight
              </span>
              <span className="text-slate-300 dark:text-slate-600">/</span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 capitalize">
                {currentView.replace('-', ' ')}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
              {viewInfo.title}
            </h1>
          </div>
        </div>

        {/* Right: Dataset Selector, UK Clock, Preview Notice, Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dataset Switcher Toggle */}
          <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => onDataModeChange('january-2026')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                dataMode === 'january-2026'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Standard challenge evaluation dataset: January 1–31, 2026 (1,488 settlement intervals)"
            >
              <Database className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Jan 2026 (1,488 SPs)</span>
            </button>
            <button
              type="button"
              onClick={() => onDataModeChange('assets-stream')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                dataMode === 'assets-stream'
                  ? 'bg-teal-700 text-white font-semibold shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Load original Elexon BMRS WINDFOR stream response from assets/ folder (73 live records)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Assets Ingest (73 Records)</span>
            </button>
          </div>

          {/* UK Timezone Indicator */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 rounded-md border border-slate-200 dark:border-slate-700">
            <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span>UK Settlement (GMT)</span>
          </div>

          {/* Backend Connection Indicator */}
          <div
            className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md border transition-colors ${
              backendStatus.connected
                ? 'bg-teal-50/90 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border-teal-300 dark:border-teal-800 shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
            title={
              backendStatus.connected
                ? `FastAPI v${backendStatus.version} • Python ${backendStatus.pythonVersion} • Pandas ${backendStatus.pandasVersion}`
                : 'Backend offline - preview fallback mode'
            }
          >
            <span
              className={`w-2 h-2 rounded-full ${
                backendStatus.connected ? 'bg-teal-500 animate-pulse' : 'bg-slate-400'
              }`}
            />
            <span className="font-semibold flex items-center gap-1">
              <Server className="w-3 h-3 opacity-80" />
              <span>{backendStatus.connected ? 'FastAPI Backend Online' : 'Preview Mode'}</span>
            </span>
          </div>

          {/* Data Status Badge with interactive explanatory popover */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDataNotice(!showDataNotice)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors shadow-2xs ${
                dataMode === 'assets-stream'
                  ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                  : 'bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-100'
              }`}
              title="Click to view dataset provenance details"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  dataMode === 'assets-stream' ? 'bg-emerald-500' : 'bg-amber-500'
                } animate-ping opacity-75`}
              ></span>
              <span className="hidden sm:inline">
                {dataMode === 'assets-stream' ? 'Live Assets Data' : 'Jan 2026 Benchmark'}
              </span>
              <span className="sm:hidden">
                {dataMode === 'assets-stream' ? 'Assets' : 'Benchmark'}
              </span>
              <Info className="w-3 h-3 opacity-80" />
            </button>

            {showDataNotice && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowDataNotice(false)}
                />
                <div className="absolute right-0 mt-2 w-84 p-4 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 z-50">
                  <div className="flex items-start gap-2.5 mb-2">
                    <div
                      className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                        dataMode === 'assets-stream'
                          ? 'bg-emerald-100 dark:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300'
                          : 'bg-amber-100 dark:bg-amber-900/80 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">
                        {dataMode === 'assets-stream'
                          ? 'Original BMRS Assets Stream'
                          : 'January 2026 Challenge Dataset'}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {dataMode === 'assets-stream'
                          ? 'Parsed from assets/ folder'
                          : 'Full Month Benchmark Simulation'}
                      </p>
                    </div>
                  </div>

                  {dataMode === 'assets-stream' ? (
                    <div className="space-y-1.5 leading-relaxed">
                      <p>
                        Currently displaying 73 raw WINDFOR forecast records parsed directly from{' '}
                        <code className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">
                          assets/Wind generation forecast (WINDFOR)...json
                        </code>
                        .
                      </p>
                      <p className="text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 p-2 rounded text-[11px]">
                        <strong>Note on FUELHH:</strong> The actual generation asset file returned an Elexon
                        HTTP 400 validation error because settlement date and publish date fields conflicted.
                        The Python backend in Phase 2 will structure the query parameters to pull matching outturns.
                      </p>
                    </div>
                  ) : (
                    <p className="leading-relaxed">
                      This dataset covers the entire challenge analysis period: January 1–31, 2026 (1,488 half-hour settlement periods).
                      It models diurnal wind cycles, Atlantic storm ramps, and genuine missing actual intervals to evaluate day-ahead purchase error.
                    </p>
                  )}

                  {backendStatus.connected && (
                    <div className="mt-2.5 p-2 bg-teal-50 dark:bg-teal-950/60 rounded border border-teal-200 dark:border-teal-800 text-[11px] text-teal-900 dark:text-teal-200">
                      <div className="font-semibold flex items-center gap-1.5">
                        <Server className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                        <span>Connected to FastAPI v{backendStatus.version}</span>
                      </div>
                      <div className="text-[10px] text-teal-700 dark:text-teal-300 mt-0.5">
                        Python {backendStatus.pythonVersion} • Pandas {backendStatus.pandasVersion} • Vectorized Metrics Active
                      </div>
                    </div>
                  )}

                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">Toggle mode in header</span>
                    <button
                      type="button"
                      onClick={() => setShowDataNotice(false)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Theme Toggle Button */}
          {onToggleDarkMode && (
            <button
              type="button"
              onClick={onToggleDarkMode}
              className="p-1.5 rounded-md text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Theme toggle"
            >
              {darkMode ? (
                <Sun className="w-3.5 h-3.5 text-amber-400 animate-in spin-in-180 duration-200" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-slate-500 animate-in spin-in-180 duration-200" />
              )}
            </button>
          )}

          {/* Refresh Button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-md text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs flex items-center gap-1.5 disabled:opacity-60"
            title="Recalculate metrics"
          >
            <RotateCw
              className={`w-3.5 h-3.5 text-slate-500 dark:text-slate-400 ${
                isRefreshing ? 'animate-spin text-teal-600 dark:text-teal-400' : ''
              }`}
            />
            <span className="hidden md:inline">Refresh</span>
          </button>

          {/* Home Link */}
          {onGoHome && (
            <button
              type="button"
              onClick={onGoHome}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs"
              title="Return to Landing Page"
            >
              <Home className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Landing</span>
            </button>
          )}

          {/* User / Desk Persona & Sign Out */}
          <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-750">
            <div className="w-7 h-7 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold text-xs flex items-center justify-center border border-teal-200 dark:border-teal-800">
              {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
            </div>
            <div className="text-left text-xs leading-none">
              <div className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[110px]">
                {currentUser?.name || 'Energy Trader'}
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[110px]">
                {currentUser?.role || 'Trading Operations'}
              </div>
            </div>
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="ml-1 text-[11px] font-medium text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 px-1.5 py-0.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                title="Sign out to home page"
              >
                Exit
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
