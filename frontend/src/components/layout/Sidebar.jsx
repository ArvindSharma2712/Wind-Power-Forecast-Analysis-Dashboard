import React from 'react';
import {
  Wind,
  LayoutDashboard,
  Search,
  LineChart,
  ShieldCheck,
  Info,
  Clock,
  ExternalLink,
  ChevronRight,
  Layers,
  Home,
  LogOut,
  User,
} from 'lucide-react';

const NAV_ITEMS = [
  {
    id: 'overview',
    label: 'Overview',
    description: 'KPIs & time-series monitor',
    icon: LayoutDashboard,
  },
  {
    id: 'forecast-explorer',
    label: 'Forecast Explorer',
    description: '30-min settlement table',
    icon: Search,
  },
  {
    id: 'accuracy-analysis',
    label: 'Accuracy Analysis',
    description: 'MAE, RMSE & error profile',
    icon: LineChart,
  },
  {
    id: 'data-quality',
    label: 'Data Quality',
    description: 'BMRS coverage & anomalies',
    icon: ShieldCheck,
  },
  {
    id: 'about-project',
    label: 'About Project',
    description: 'Business context & methodology',
    icon: Info,
  },
];

export function Sidebar({
  currentView,
  onSelectView,
  mobileOpen = false,
  onCloseMobile,
  onGoHome,
  onLogout,
  currentUser,
  darkMode = false,
}) {
  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-xs shadow-teal-600/30">
              <Wind className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 dark:text-white text-lg tracking-tight">WindInsight</span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-sm bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  UK BSC
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Renewable Generation Monitor</p>
            </div>
          </div>
        </div>

        {/* Home & Target Context Bar */}
        <div className="px-3 py-2 bg-slate-50 dark:bg-slate-850 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          {onGoHome && (
            <button
              type="button"
              onClick={onGoHome}
              className="flex items-center gap-1.5 px-2.5 py-1 text-slate-700 dark:text-slate-300 hover:text-teal-800 dark:hover:text-teal-300 bg-white dark:bg-slate-900 hover:bg-teal-50 dark:hover:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 font-semibold transition-colors"
            >
              <Home className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Landing Page</span>
            </button>
          )}
          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
            D-1 Gate
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Analytics Views
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectView(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-semibold shadow-2xs border border-teal-200/60 dark:border-teal-800'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                  }`}
                />
                <div className="flex-1 text-left">
                  <div className="leading-tight">{item.label}</div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 font-normal leading-tight group-hover:text-slate-500 dark:group-hover:text-slate-400">
                    {item.description}
                  </div>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />}
              </button>
            );
          })}
        </nav>

        {/* User Account / Sign Out Section */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-850 dark:bg-slate-900/90">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold text-xs flex items-center justify-center border border-teal-200 dark:border-teal-800">
                {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
              </div>
              <div className="text-left text-xs leading-tight">
                <div className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                  {currentUser?.name || 'Energy Trader'}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
                  {currentUser?.role || 'Trading Operations'}
                </div>
              </div>
            </div>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                title="Sign Out to Home Page"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Market:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">UK NGET / BSC</span>
          </div>
        </div>
      </aside>
    </>
  );
}
