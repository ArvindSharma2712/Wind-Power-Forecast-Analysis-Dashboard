import React, { useState } from 'react';
import {
  Wind,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Activity,
  Layers,
  Database,
  Moon,
  Sun,
  FileSpreadsheet,
  Zap,
  BarChart2,
  Target,
  FileCheck,
  Search,
  Compass,
  ArrowUpRight,
  ChevronRight,
  UserCheck,
  Award,
} from 'lucide-react';

export function LandingPage({
  onLaunchDashboard,
  onOpenLogin,
  darkMode = false,
  onToggleDarkMode,
}) {
  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3000);
      setEmailInput('');
    }
  };

  return (
    <div
      className={`min-h-screen ${
        darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-[#f3f9f9] text-slate-800'
      } font-sans selection:bg-teal-500 selection:text-white transition-colors duration-200`}
    >
      {/* ─────────────────────────────────────────────────────────────
          NAVBAR (Matching Page 1 top)
      ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#f3f9f9]/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-teal-100/60 dark:border-slate-800 px-4 sm:px-8 py-4 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Sub-tag */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-xs shadow-teal-600/30">
              <Wind className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white uppercase">
                WIND-INSIGHT
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-teal-800 dark:text-teal-300 bg-teal-100/70 dark:bg-teal-950/80 border border-teal-200/80 dark:border-teal-800 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3 text-teal-700 dark:text-teal-400" />
                UK Energy Desk
              </span>
            </div>
          </div>

          {/* Nav Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Dark Mode Toggle Button */}
            <button
              type="button"
              onClick={onToggleDarkMode}
              className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-amber-400 hover:bg-teal-50 dark:hover:bg-slate-800 rounded-full transition-all"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Theme toggle"
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-180 duration-200" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600 animate-in spin-in-180 duration-200" />
              )}
            </button>

            <button
              type="button"
              onClick={onOpenLogin}
              className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={onLaunchDashboard}
              className="text-xs sm:text-sm font-bold text-teal-950 dark:text-teal-900 bg-teal-200/80 dark:bg-teal-300 hover:bg-teal-300 dark:hover:bg-teal-200 border border-teal-300 dark:border-teal-200 px-4 py-2 rounded-full transition-all shadow-xs hover:shadow-sm"
            >
              Launch Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          PAGE 1: HERO SECTION
      ───────────────────────────────────────────────────────────── */}
      <section className="relative pt-8 sm:pt-14 pb-16 px-4 sm:px-8 overflow-hidden">
        {/* Soft cyan & teal ambient blur */}
        <div className="absolute top-10 right-10 w-96 h-96 bg-teal-200/30 dark:bg-teal-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-cyan-200/30 dark:bg-cyan-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Bold Typography & CTAs */}
          <div className="lg:col-span-6 space-y-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100/80 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>AI-POWERED RENEWABLE INTELLIGENCE</span>
            </div>

            {/* Massive Bold Headline (Matching: Analyze. Optimize. Get Hired.) */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.05]">
              Analyze. <br />
              Forecast. <br />
              <span className="text-teal-600 dark:text-teal-400">Buy Power.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl">
              Compare day-ahead wind power forecasts against actual UK grid generation,
              quantify imbalance risks, bridge forecast error gaps, and optimize wholesale
              electricity purchase decisions with our AI-powered utility assistant.
            </p>

            {/* Primary Action Button */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onLaunchDashboard}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold text-white bg-[#00bcd4] hover:bg-[#00acc1] dark:bg-teal-500 dark:hover:bg-teal-400 dark:text-slate-950 transition-all shadow-md shadow-cyan-500/25 uppercase tracking-wider"
              >
                <span>ANALYZE FORECASTS</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onOpenLogin}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 transition-all shadow-2xs"
              >
                <span>OPERATOR SIGN IN</span>
              </button>
            </div>

            {/* Floating Persona tags (from page 1 image) */}
            <div className="pt-4 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" /> Elexon BMRS Feeds
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" /> D-1 Gate Cutoff
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" /> Zero Lookahead Bias
              </span>
            </div>
          </div>

          {/* Right Column: Interactive Visual Pipeline Card (Matching Page 1 right side) */}
          <div className="lg:col-span-6 relative">
            <div className="relative p-6 sm:p-8 bg-white/90 dark:bg-slate-900/95 backdrop-blur-sm rounded-3xl border border-teal-100/80 dark:border-slate-800 shadow-xl shadow-teal-900/5 dark:shadow-black/40">
              {/* Floating Node Chips */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 font-bold">
                  <Wind className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>WINDFOR FORECAST</span>
                </div>
                <div className="text-slate-300 dark:text-slate-600 font-mono">───►</div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 text-cyan-800 dark:text-cyan-300 font-bold">
                  <Activity className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  <span>D-1 GATE CUTOFF</span>
                </div>
                <div className="text-slate-300 dark:text-slate-600 font-mono">───►</div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold">
                  <Target className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>BALANCED</span>
                </div>
              </div>

              {/* Main Preview Card Content */}
              <div className="mt-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                      Dashboard Target
                    </span>
                    <span className="text-base font-extrabold text-slate-900 dark:text-white">
                      UK GRID • JANUARY 2026
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={onLaunchDashboard}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-teal-900 dark:text-teal-200 bg-teal-100 dark:bg-teal-900/80 hover:bg-teal-200 dark:hover:bg-teal-800 transition-colors uppercase tracking-wider flex items-center gap-1"
                  >
                    <span>OPEN DASHBOARD</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Big Circular Accuracy Gauge */}
                <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-2xl bg-teal-50/50 dark:bg-slate-800/60 border border-teal-100 dark:border-slate-700">
                  <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        className="text-teal-100 dark:text-slate-700 stroke-current"
                        strokeWidth="10"
                        fill="transparent"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        className="text-teal-600 dark:text-teal-400 stroke-current"
                        strokeWidth="10"
                        strokeDasharray="264"
                        strokeDashoffset="26"
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-2xl font-black text-slate-900 dark:text-white">98.9%</span>
                      <span className="text-[9px] font-bold text-teal-700 dark:text-teal-300 uppercase tracking-tight">
                        DATA COVERAGE
                      </span>
                      <span className="text-[8px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase">
                        EXCELLENT
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Progress Bars */}
                  <div className="flex-1 w-full space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300 text-[11px] mb-1">
                        <span>MATCH ALIGNMENT</span>
                        <span className="text-teal-700 dark:text-teal-400 font-mono">89%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                        <div className="h-full bg-teal-500 rounded-full" style={{ width: '89%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300 text-[11px] mb-1">
                        <span>INTERVAL COVERAGE</span>
                        <span className="text-teal-700 dark:text-teal-400 font-mono">98.9%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                        <div className="h-full bg-teal-600 dark:bg-teal-400 rounded-full" style={{ width: '98.9%' }} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 text-[10px] text-slate-500 dark:text-slate-400">
                      <div>
                        <span>WIND CAPACITY:</span>{' '}
                        <strong className="text-slate-800 dark:text-slate-200">12.4 GW</strong>
                      </div>
                      <div>
                        <span>DAILY SPs:</span>{' '}
                        <strong className="text-slate-800 dark:text-slate-200">48 / Day</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tag Pills */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
                    VERIFIED PROTOCOLS
                  </span>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                      D-1 CUTOFF LOCK
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-teal-100/70 dark:bg-teal-950/80 font-bold text-teal-800 dark:text-teal-300 text-[11px]">
                      MAE OPTIMIZED
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                      FUELHH VERIFIED
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-cyan-100/70 dark:bg-cyan-950/80 font-bold text-cyan-800 dark:text-cyan-300 text-[11px]">
                      ZERO LOOKAHEAD
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                      ELEXON BSC
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          PAGE 2: PROOF STATS BAR & 4 FEATURE TILES
      ───────────────────────────────────────────────────────────── */}
      <section className="py-12 px-4 sm:px-8 border-y border-teal-100/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 transition-colors">
        <div className="max-w-7xl mx-auto">
          {/* Live Demo Header Tag */}
          <div className="flex items-center justify-between mb-8">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-100/80 dark:bg-teal-950/80 text-teal-900 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              LIVE DEMO READY
            </span>
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" /> Day-Ahead Buyer
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" /> BSC Auditor
              </span>
            </div>
          </div>

          {/* 4 Proof Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-slate-100 dark:border-slate-800">
            {/* Metric 1 */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-slate-800 border border-teal-200 dark:border-slate-700 flex items-center justify-center text-teal-700 dark:text-teal-400 shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">1,488</div>
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">
                  INTERVALS AUDITED
                </div>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-slate-800 border border-emerald-200 dark:border-slate-700 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">98.9%</div>
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">
                  DATA COVERAGE
                </div>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-slate-800 border border-cyan-200 dark:border-slate-700 flex items-center justify-center text-cyan-700 dark:text-cyan-400 shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">48 SPs</div>
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">
                  DAILY RESOLUTION
                </div>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-slate-800 border border-teal-200 dark:border-slate-700 flex items-center justify-center text-teal-700 dark:text-teal-400 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">AI</div>
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">
                  POWERED INSIGHTS
                </div>
              </div>
            </div>
          </div>

          {/* 4 Feature Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <button
              type="button"
              onClick={onLaunchDashboard}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-teal-100 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-600 hover:shadow-md transition-all text-left flex items-start gap-3.5 group"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-slate-800 text-teal-700 dark:text-teal-400 flex items-center justify-center shrink-0 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Forecast Explorer</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Deep scan & 30-min settlement intervals</p>
              </div>
            </button>

            <button
              type="button"
              onClick={onLaunchDashboard}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-teal-100 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-600 hover:shadow-md transition-all text-left flex items-start gap-3.5 group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Accuracy Analysis</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Quantify signed error, MAE & RMSE</p>
              </div>
            </button>

            <button
              type="button"
              onClick={onLaunchDashboard}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-teal-100 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-600 hover:shadow-md transition-all text-left flex items-start gap-3.5 group"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-slate-800 text-cyan-700 dark:text-cyan-400 flex items-center justify-center shrink-0 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Data Quality Audit</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Telemetry gaps & BMRS zero isolation</p>
              </div>
            </button>

            <button
              type="button"
              onClick={onLaunchDashboard}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-teal-100 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-600 hover:shadow-md transition-all text-left flex items-start gap-3.5 group"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-slate-800 text-teal-700 dark:text-teal-400 flex items-center justify-center shrink-0 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Purchase Decision</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Tailored for UK Day-Ahead buyers</p>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          PAGE 2 & 3: "WHY WIND-INSIGHT?" & 3 FEATURE CARDS
      ───────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section Heading */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              WHY <span className="text-teal-600 dark:text-teal-400">WIND-INSIGHT?</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg mt-3 leading-relaxed">
              Engineered to make UK utilities anticipate renewable generation swings and beat
              balancing penalty cash-outs with advanced meteorological and settlement error analysis.
            </p>
          </div>

          {/* 3 Large Feature Cards (Matching Page 3 top) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center mb-6">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-extrabold uppercase tracking-tight text-slate-900 dark:text-white mb-3">
                  INSTANT FORECAST ANALYSIS
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  Upload or stream settlement intervals to get an instant visual match score,
                  diurnal pattern trends, and detailed category error breakdowns comparing
                  day-ahead WINDFOR forecasts against actual FUELHH generation.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center text-xs font-bold text-teal-700 dark:text-teal-400">
                <span>Explore 30-min resolution</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400 flex items-center justify-center mb-6">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-extrabold uppercase tracking-tight text-slate-900 dark:text-white mb-3">
                  AI-POWERED RECOMMENDATIONS
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  Receive actionable, interval-specific purchasing suggestions and custom risk
                  hedging points tailored precisely to upcoming Atlantic storm ramps and
                  high-pressure Dunkelflaute calm weather fronts.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center text-xs font-bold text-cyan-700 dark:text-cyan-400">
                <span>Quantify imbalance volume</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-6">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-extrabold uppercase tracking-tight text-slate-900 dark:text-white mb-3">
                  DECISION CUTOFF ALIGNMENT
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  Ensure your analysis strictly adheres to the 17:00 GMT D-1 gate closure cutoff.
                  Completely eliminates lookahead contamination and isolates missing observations
                  from genuine 0.0 MW generation.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center text-xs font-bold text-emerald-700 dark:text-emerald-400">
                <span>Audit-compliant matching</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          PAGE 3 & 4: TEAL CTA CONTAINER ("Let's Find Your Match!")
      ───────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-8 bg-teal-600 dark:bg-teal-700 text-white transition-colors">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
            Let's Analyze Your Forecast!
          </h2>
          <p className="text-teal-100 text-sm sm:text-base max-w-xl mx-auto">
            Review your forecast intervals and actual generation to get AI-powered insights,
            MAE calculations, and day-ahead electricity purchase recommendations.
          </p>

          {/* Stepper Card */}
          <div className="mt-10 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-3xl p-6 sm:p-10 shadow-2xl text-left border border-teal-500/20 dark:border-slate-800 transition-colors">
            <div className="text-center mb-8">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-4">
                FOLLOW THESE SIMPLE STEPS TO ANALYZE YOUR FORECAST
              </span>

              {/* Stepper (1, 2, 3) */}
              <div className="flex items-center justify-center gap-3 sm:gap-6 text-xs font-bold">
                <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400">
                  <span className="w-7 h-7 rounded-full bg-teal-600 dark:bg-teal-500 text-white dark:text-slate-950 flex items-center justify-center text-xs">
                    1
                  </span>
                  <span>SELECT DATASET</span>
                </div>
                <span className="text-slate-300 dark:text-slate-600 font-mono">›</span>
                <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                  <span className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center text-xs">
                    2
                  </span>
                  <span>SET TIME HORIZON</span>
                </div>
                <span className="text-slate-300 dark:text-slate-600 font-mono">›</span>
                <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                  <span className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center text-xs">
                    3
                  </span>
                  <span>DONE</span>
                </div>
              </div>
            </div>

            {/* Instruction Box (Page 4) */}
            <div className="p-6 rounded-2xl bg-teal-50/60 dark:bg-slate-800/60 border border-teal-200/80 dark:border-slate-700 mb-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-teal-600 dark:bg-teal-500 text-white dark:text-slate-950 flex items-center justify-center shrink-0 shadow-xs">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                  Start by launching your dashboard workspace
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  Evaluate January 2026 UK wind generation benchmarks (1,488 settlement intervals)
                  or inspect the live 73-record Elexon BMRS WINDFOR stream response directly.
                </p>
              </div>
            </div>

            {/* Big Launch Button */}
            <div className="text-center">
              <button
                type="button"
                onClick={onLaunchDashboard}
                className="w-full sm:w-auto px-10 py-4 rounded-full text-sm font-extrabold text-white bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400 dark:text-slate-950 transition-all shadow-lg shadow-teal-600/30 uppercase tracking-wider inline-flex items-center justify-center gap-2 group"
              >
                <span>LAUNCH FORECAST DASHBOARD</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          PAGE 4: FOOTER (Matching page 4 layout)
      ───────────────────────────────────────────────────────────── */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 pt-16 pb-12 px-4 sm:px-8 transition-colors">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-slate-100 dark:border-slate-800">
            {/* Left 5 Cols: Brand & Newsletter */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white">
                  <Wind className="w-4 h-4" />
                </div>
                <span className="text-lg font-black uppercase text-slate-900 dark:text-white tracking-tight">
                  WIND-INSIGHT
                </span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
                Stay updated on our forecast accuracy models, BMRS pipeline updates, and
                day-ahead electricity purchasing optimizations:
              </p>

              <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Your Email Address"
                  className="flex-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-800 dark:text-slate-100"
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 rounded-lg transition-colors shrink-0"
                >
                  {subscribed ? 'Subscribed!' : 'Subscribe'}
                </button>
              </form>
            </div>

            {/* Right 7 Cols: 3 Nav Columns */}
            <div className="md:col-span-7 grid grid-cols-3 gap-6 text-xs">
              <div>
                <h5 className="font-extrabold uppercase text-slate-900 dark:text-white tracking-wider mb-3">
                  PRODUCT
                </h5>
                <ul className="space-y-2 text-slate-500 dark:text-slate-400">
                  <li>
                    <button
                      type="button"
                      onClick={onLaunchDashboard}
                      className="hover:text-teal-700 dark:hover:text-teal-400 transition-colors"
                    >
                      Overview Dashboard
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={onLaunchDashboard}
                      className="hover:text-teal-700 dark:hover:text-teal-400 transition-colors"
                    >
                      Forecast Explorer
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={onLaunchDashboard}
                      className="hover:text-teal-700 dark:hover:text-teal-400 transition-colors"
                    >
                      MAE / RMSE Analysis
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={onLaunchDashboard}
                      className="hover:text-teal-700 dark:hover:text-teal-400 transition-colors"
                    >
                      Data Quality Audit
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <h5 className="font-extrabold uppercase text-slate-900 dark:text-white tracking-wider mb-3">
                  DEVELOPERS
                </h5>
                <ul className="space-y-2 text-slate-500 dark:text-slate-400">
                  <li>
                    <a
                      href="https://bmrs.elexon.co.uk/"
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-teal-700 dark:hover:text-teal-400 transition-colors"
                    >
                      Elexon BMRS APIs
                    </a>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={onLaunchDashboard}
                      className="hover:text-teal-700 dark:hover:text-teal-400 transition-colors"
                    >
                      System Architecture
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={onLaunchDashboard}
                      className="hover:text-teal-700 dark:hover:text-teal-400 transition-colors"
                    >
                      FastAPI Python Docs
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={onLaunchDashboard}
                      className="hover:text-teal-700 dark:hover:text-teal-400 transition-colors"
                    >
                      Docker Config
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <h5 className="font-extrabold uppercase text-slate-900 dark:text-white tracking-wider mb-3">
                  COMPANY
                </h5>
                <ul className="space-y-2 text-slate-500 dark:text-slate-400">
                  <li>
                    <button
                      type="button"
                      onClick={onLaunchDashboard}
                      className="hover:text-teal-700 dark:hover:text-teal-400 transition-colors"
                    >
                      About Challenge
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={onLaunchDashboard}
                      className="hover:text-teal-700 dark:hover:text-teal-400 transition-colors"
                    >
                      UK Utility Context
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={onLaunchDashboard}
                      className="hover:text-teal-700 dark:hover:text-teal-400 transition-colors"
                    >
                      Methodology Notes
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={onOpenLogin}
                      className="hover:text-teal-700 dark:hover:text-teal-400 transition-colors"
                    >
                      Trading Desk Portal
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 dark:text-slate-500">
            <div>© 2026 WIND-INSIGHT Team. All rights reserved.</div>
            <div className="flex items-center gap-4">
              <span className="text-teal-700 dark:text-teal-400 font-semibold">UK Electricity Market BSC Compliance</span>
              <span>•</span>
              <span>Built for Hiring Challenge Review</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
