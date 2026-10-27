import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, RefreshCw, Radio } from 'lucide-react';

export default function Header({
  title,
  subtitle = 'PantryPal Operations & Management Center',
  isLive = true,
  lastSync,
  onRefresh,
  isRefreshing = false,
}) {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap justify-between items-center sticky top-0 z-30 shadow-xs gap-3">
      <div>
        <h1 className="font-extrabold text-xl text-slate-900 tracking-tight">{title}</h1>
        <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
      </div>

      <div className="flex items-center space-x-3">
        {/* Real-Time Live Sync Status */}
        {isLive && (
          <div className="flex items-center space-x-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 text-xs font-semibold text-emerald-800 shadow-2xs">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
            </span>
            <span>Live Real-Time Feed</span>
            {lastSync && (
              <span className="text-[10px] text-emerald-600 font-mono pl-1 border-l border-emerald-300">
                {lastSync}
              </span>
            )}
          </div>
        )}

        {/* Instant Refresh Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Manual sync now"
            className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Sync</span>
          </button>
        )}

        {/* System Health */}
        <div className="hidden md:flex items-center space-x-1.5 bg-slate-100 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>MongoDB Live</span>
        </div>

        {/* Admin Profile */}
        <div className="flex items-center space-x-2 border-l pl-3 border-slate-200">
          <img
            src={user?.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
            alt="Admin"
            className="w-8 h-8 rounded-full object-cover border border-slate-200"
          />
          <div className="text-xs">
            <span className="font-bold text-slate-800 block leading-tight">{user?.name || 'Admin'}</span>
            <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Super Administrator</span>
          </div>
        </div>
      </div>
    </header>
  );
}
