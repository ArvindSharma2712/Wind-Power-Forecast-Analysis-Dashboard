import React, { useState } from 'react';
import {
  X,
  Wind,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  Zap,
} from 'lucide-react';

export function LoginModal({ isOpen, onClose, onLoginSuccess, darkMode = false }) {
  const [email, setEmail] = useState('trader@uk-utility.co.uk');
  const [password, setPassword] = useState('••••••••••••');
  const [role, setRole] = useState('Senior Renewable Energy Trader');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onLoginSuccess({
        name: 'Arvin Patel',
        role: role,
        email: email,
        organization: 'UK National Electricity Utility',
      });
      onClose();
    }, 400);
  };

  const handleQuickLogin = (demoRole) => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onLoginSuccess({
        name: demoRole === 'trader' ? 'Alex Morgan' : 'Elena Rostova',
        role: demoRole === 'trader' ? 'Day-Ahead Energy Trader' : 'Portfolio Risk Analyst',
        email: `${demoRole}@uk-energy-desk.co.uk`,
        organization: 'UK National Electricity Utility',
      });
      onClose();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 z-10 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150 transition-colors">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-teal-600/30">
            <Wind className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Sign In to WindInsight
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Access UK Renewable Generation & Day-Ahead Forecast Analytics
          </p>
        </div>

        {/* Quick 1-Click Trader Login Buttons */}
        <div className="mb-5 p-3.5 bg-teal-50/80 dark:bg-slate-800/80 rounded-xl border border-teal-200 dark:border-slate-700">
          <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900 dark:text-teal-300 uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Instant Demo Access (1-Click)</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('trader')}
              disabled={isSubmitting}
              className="py-2 px-3 text-xs font-semibold text-teal-950 dark:text-teal-200 bg-white dark:bg-slate-900 border border-teal-300 dark:border-slate-700 rounded-lg hover:bg-teal-100/60 dark:hover:bg-slate-800 transition-colors text-center shadow-2xs"
            >
              ⚡ Energy Trader
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('risk')}
              disabled={isSubmitting}
              className="py-2 px-3 text-xs font-semibold text-teal-950 dark:text-teal-200 bg-white dark:bg-slate-900 border border-teal-300 dark:border-slate-700 rounded-lg hover:bg-teal-100/60 dark:hover:bg-slate-800 transition-colors text-center shadow-2xs"
            >
              📊 Risk Analyst
            </button>
          </div>
        </div>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          <span className="shrink-0 mx-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Or sign in with email
          </span>
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
        </div>

        {/* Standard Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Work Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="trader@utility.co.uk"
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <span className="text-[11px] text-teal-600 dark:text-teal-400 hover:underline cursor-pointer">
                Forgot password?
              </span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-slate-900 transition-all font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400 dark:text-slate-950 rounded-xl transition-all shadow-sm shadow-teal-600/30 flex items-center justify-center gap-2 group disabled:opacity-70 mt-2"
          >
            {isSubmitting ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Security Footer Notice */}
        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span>Elexon BMRS BSC Party Authorized Access</span>
        </div>
      </div>
    </div>
  );
}
