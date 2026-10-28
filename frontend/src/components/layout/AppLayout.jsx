import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppLayout({
  currentView,
  onSelectView,
  onRefresh,
  isRefreshing,
  dataMode,
  onDataModeChange,
  onGoHome,
  onLogout,
  currentUser,
  darkMode = false,
  onToggleDarkMode,
  children,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} flex transition-colors`}>
      {/* Sidebar (Desktop sticky / Mobile drawer) */}
      <Sidebar
        currentView={currentView}
        onSelectView={onSelectView}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        onGoHome={onGoHome}
        onLogout={onLogout}
        currentUser={currentUser}
        darkMode={darkMode}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        <Topbar
          currentView={currentView}
          onOpenMobile={() => setMobileOpen(true)}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
          dataMode={dataMode}
          onDataModeChange={onDataModeChange}
          onGoHome={onGoHome}
          onLogout={onLogout}
          currentUser={currentUser}
          darkMode={darkMode}
          onToggleDarkMode={onToggleDarkMode}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>

        {/* Global Footer note */}
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 px-6 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 transition-colors">
          <div>
            WindInsight • UK Electricity Utility Day-Ahead Renewable Generation Analysis • January 2026
          </div>
          <div className="flex items-center gap-4 text-slate-400 dark:text-slate-500">
            <span>FUELHH & WINDFOR API Specification</span>
            <span>•</span>
            <span className="text-teal-700 dark:text-teal-400 font-medium">Frontend Preview Phase</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
