import React from 'react';
import {
  Wind,
  Layers,
  Database,
  Cpu,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileCode2,
  Users,
  Compass,
  Sparkles,
  Info,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export function AboutProject() {
  return (
    <div className="space-y-8 max-w-5xl">
      {/* Hero Executive Summary Card */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-semibold uppercase tracking-wider mb-3">
          <Wind className="w-3.5 h-3.5" />
          Hiring Challenge Submission • Full Stack Engineering
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Wind Power Forecast Analysis Dashboard
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed max-w-3xl">
          A specialized decision-support platform designed for a UK electricity utility.
          Because power must be contracted a day in advance in wholesale markets, accurate wind generation
          forecasts are paramount for estimating imbalance volume and mitigating high Balancing Mechanism exposure.
        </p>

        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-400 dark:text-slate-500 block font-medium">Analysis Time Horizon</span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">January 1–31, 2026</span>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 block font-medium">Target Market</span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">UK NGET / Elexon BSC</span>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 block font-medium">Current Project Phase</span>
            <span className="text-sm font-bold text-teal-700 dark:text-teal-400">Phase 1: Frontend Architecture (Approved for Review)</span>
          </div>
        </div>
      </div>

      {/* Planned End-to-End System Architecture (Visual Flow) */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors">
        <div className="flex items-center justify-between gap-2 mb-2">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            Planned End-to-End System Architecture
          </h3>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded">
            Target Architecture
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Architectural flow connecting official Elexon BMRS datasets to a Python processing backend and the React frontend:
        </p>

        {/* Visual Architecture Flow Diagram */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          {/* Step 1 */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between transition-colors">
            <div>
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center mb-2">
                1
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">Elexon BMRS Feeds</h4>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Raw UK power market datasets:
              </p>
              <ul className="mt-2 space-y-1 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                <li>• WINDFOR (Forecast)</li>
                <li>• FUELHH (Actual Wind)</li>
              </ul>
            </div>
            <div className="mt-3 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
              30-min settlement resolution
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between transition-colors">
            <div>
              <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 font-bold flex items-center justify-center mb-2">
                2
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">Python Backend</h4>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Data pipeline in FastAPI & Pandas:
              </p>
              <ul className="mt-2 space-y-1 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                <li>• Cleaning & Validation</li>
                <li>• Timezone Europe/London</li>
                <li>• Missing actual isolation</li>
              </ul>
            </div>
            <div className="mt-3 text-[10px] text-emerald-800 dark:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Active: Python 3.13 + FastAPI Live</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between transition-colors">
            <div>
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center mb-2">
                3
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">Cutoff Matching Engine</h4>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Day-Ahead purchase logic:
              </p>
              <ul className="mt-2 space-y-1 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                <li>• Locks D-1 gate cutoff</li>
                <li>• Eliminates lookahead bias</li>
                <li>• Matches by startTime</li>
              </ul>
            </div>
            <div className="mt-3 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
              MAE & RMSE calculation
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex flex-col justify-between transition-colors">
            <div>
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center mb-2 shadow-xs">
                4
              </div>
              <h4 className="font-bold text-emerald-950 dark:text-emerald-200 text-sm">React Dashboard</h4>
              <p className="text-emerald-800 dark:text-emerald-300 mt-1">
                Interactive executive UI:
              </p>
              <ul className="mt-2 space-y-1 text-emerald-900 dark:text-emerald-300 font-mono text-[11px]">
                <li>• Recharts Dual-Line Monitor</li>
                <li>• Explorer & Error Tables</li>
                <li>• Full Jan 2026 filterable</li>
              </ul>
            </div>
            <div className="mt-3 text-[10px] text-emerald-800 dark:text-emerald-200 font-semibold bg-white/80 dark:bg-emerald-900/40 px-2 py-0.5 rounded">
              Active: Phase 1 Complete
            </div>
          </div>
        </div>
      </div>

      {/* Business Problem & Users */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Utility Business Problem & Users
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            The client is an energy supplier operating in the UK wholesale market. Electricity cannot easily be stored
            at grid scale, so utilities purchase generation 24–36 hours ahead in day-ahead auctions.
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-2">
            If renewable wind yields less than forecast, the utility must rapidly buy balance-power at short notice,
            frequently at costly imbalance cash-out prices. Conversely, over-contracting leads to surplus sell-offs.
          </p>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            <strong>Target Stakeholders:</strong> Day-Ahead Energy Traders, Portfolio Risk Analysts, Renewable Operations Desks.
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <Database className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Official Elexon BMRS Datasets
            </h3>
          </div>
          <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-100 dark:border-slate-800">
              <strong className="text-slate-900 dark:text-slate-100 block font-mono">1. WINDFOR (Wind Generation Forecast)</strong>
              <span>Provides half-hourly wind generation forecasts across Great Britain. Key fields: <code className="bg-white dark:bg-slate-900 px-1 py-0.2 rounded font-mono border border-slate-200 dark:border-slate-700">startTime</code> (delivery target), <code className="bg-white dark:bg-slate-900 px-1 py-0.2 rounded font-mono border border-slate-200 dark:border-slate-700">publishTime</code> (when available), and <code className="bg-white dark:bg-slate-900 px-1 py-0.2 rounded font-mono border border-slate-200 dark:border-slate-700">generation</code> (MW).</span>
            </div>
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-100 dark:border-slate-800">
              <strong className="text-slate-900 dark:text-slate-100 block font-mono">2. FUELHH (Actual Generation by Fuel Type)</strong>
              <span>Outturn generation with 30-minute resolution. Filtered strictly to <code className="bg-white dark:bg-slate-900 px-1 py-0.2 rounded font-mono border border-slate-200 dark:border-slate-700">fuelType = 'WIND'</code>. Key fields: <code className="bg-white dark:bg-slate-900 px-1 py-0.2 rounded font-mono border border-slate-200 dark:border-slate-700">startTime</code> and <code className="bg-white dark:bg-slate-900 px-1 py-0.2 rounded font-mono border border-slate-200 dark:border-slate-700">generation</code> (MW).</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Tools Usage Disclosure */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            AI Tools Usage Disclosure
          </h3>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          In strict accordance with the challenge guidelines, all AI tool assistance is explicitly disclosed:
        </p>
        <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 space-y-1.5 leading-relaxed">
          <p>
            • <strong>Google Antigravity & Agentic Pair Programming:</strong> Employed as a pair-programming coding assistant for scaffolding React components, generating deterministic synthetic mock datasets conforming to UK settlement intervals, formulating statistical verification tests, and refining design aesthetics.
          </p>
          <p>
            • <strong>Mathematical Integrity:</strong> All error calculations (MAE, RMSE, Signed Error) and UI states are verified against standard Elexon BMRS day-ahead market mechanics and standard energy-analytics practice.
          </p>
        </div>
      </div>

      {/* Limitations of Current Preview Phase */}
      <div className="p-5 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 transition-colors">
        <div className="flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-amber-950 dark:text-amber-300">Phase 1 Limitations & Boundary Scope</h4>
            <p>
              1. <strong>Demonstration Data:</strong> The current preview displays high-fidelity synthetic mock data simulating January 2026 UK wind generation. Real API calls will be wired up via FastAPI in Phase 2.
            </p>
            <p>
              2. <strong>Demand Data Boundary:</strong> This application calculates forecast accuracy of generation. It does not calculate absolute net power deficit because client customer demand (load) data is not part of the challenge datasets.
            </p>
            <p>
              3. <strong>Backend Prerequisite:</strong> The Python backend, Docker configuration, and cloud deployment will be initiated upon approval of this frontend review.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
