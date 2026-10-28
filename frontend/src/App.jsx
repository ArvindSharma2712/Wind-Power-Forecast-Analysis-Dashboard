import React, { useState, useEffect } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './components/landing/LandingPage';
import { LoginModal } from './components/auth/LoginModal';
import { Overview } from './pages/Overview';
import { ForecastExplorer } from './pages/ForecastExplorer';
import { AccuracyAnalysis } from './pages/AccuracyAnalysis';
import { DataQuality } from './pages/DataQuality';
import { AboutProject } from './pages/AboutProject';
import { analyticsService } from './services/analyticsService';

function App() {
  // Sync view with URL hash if present
  const getInitialView = () => {
    const hash = window.location.hash.replace('#', '');
    const validViews = ['overview', 'forecast-explorer', 'accuracy-analysis', 'data-quality', 'about-project', 'home'];
    return validViews.includes(hash) ? hash : 'overview';
  };

  const [currentView, setCurrentView] = useState(getInitialView);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Dark Mode State
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  // Sync dark class on document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleToggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  };

  const [dataMode, setDataMode] = useState('january-2026'); // 'january-2026' or 'assets-stream'
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-01-31');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Update hash when view changes
  const handleSelectView = (viewId) => {
    setCurrentView(viewId);
    window.location.hash = viewId;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Switch between January 2026 Benchmark and Assets Ingest
  const handleDataModeChange = (newMode) => {
    setDataMode(newMode);
    analyticsService.setDataMode(newMode);
    if (newMode === 'assets-stream') {
      setStartDate('2026-10-26');
      setEndDate('2026-10-29');
    } else {
      setStartDate('2026-01-01');
      setEndDate('2026-01-31');
    }
    setRefreshTrigger((prev) => prev + 1);
  };

  // Login handlers
  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    setIsAuthenticated(true);
    setCurrentView('overview');
    window.location.hash = 'overview';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    window.location.hash = 'home';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoHome = () => {
    window.location.hash = 'home';
    setIsAuthenticated(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Listen for hash changes (browser back/forward)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'home' || hash === 'landing') {
        setIsAuthenticated(false);
      } else {
        const validViews = ['overview', 'forecast-explorer', 'accuracy-analysis', 'data-quality', 'about-project'];
        if (validViews.includes(hash)) {
          setCurrentView(hash);
        }
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleDateChange = (newStart, newEnd) => {
    setStartDate(newStart);
    setEndDate(newEnd);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshTrigger((prev) => prev + 1);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  // If user is NOT authenticated, show the Landing Page requested by user
  if (!isAuthenticated) {
    return (
      <div className={darkMode ? 'dark' : ''}>
        <LandingPage
          onLaunchDashboard={() => setIsLoginModalOpen(true)}
          onOpenLogin={() => setIsLoginModalOpen(true)}
          darkMode={darkMode}
          onToggleDarkMode={handleToggleDarkMode}
        />
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
          darkMode={darkMode}
        />
      </div>
    );
  }

  // When user is authenticated, open the current Wind Power Forecast Analysis Dashboard
  return (
    <div className={darkMode ? 'dark' : ''}>
      <AppLayout
        currentView={currentView}
        onSelectView={handleSelectView}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        dataMode={dataMode}
        onDataModeChange={handleDataModeChange}
        onGoHome={handleGoHome}
        onLogout={handleLogout}
        currentUser={currentUser}
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
      >
        {currentView === 'overview' && (
          <Overview
            startDate={startDate}
            endDate={endDate}
            onDateChange={handleDateChange}
            refreshTrigger={refreshTrigger}
            dataMode={dataMode}
            darkMode={darkMode}
          />
        )}

        {currentView === 'forecast-explorer' && (
          <ForecastExplorer
            startDate={startDate}
            endDate={endDate}
            onDateChange={handleDateChange}
            refreshTrigger={refreshTrigger}
            dataMode={dataMode}
            darkMode={darkMode}
          />
        )}

        {currentView === 'accuracy-analysis' && (
          <AccuracyAnalysis
            startDate={startDate}
            endDate={endDate}
            onDateChange={handleDateChange}
            refreshTrigger={refreshTrigger}
            dataMode={dataMode}
            darkMode={darkMode}
          />
        )}

        {currentView === 'data-quality' && (
          <DataQuality
            startDate={startDate}
            endDate={endDate}
            onDateChange={handleDateChange}
            refreshTrigger={refreshTrigger}
            dataMode={dataMode}
            darkMode={darkMode}
          />
        )}

        {currentView === 'about-project' && (
          <AboutProject dataMode={dataMode} darkMode={darkMode} />
        )}
      </AppLayout>
    </div>
  );
}

export default App;