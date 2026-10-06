import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, ShieldCheck } from 'lucide-react';

export default function Header({ title }) {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-30 shadow-xs">
      <div>
        <h1 className="font-extrabold text-xl text-slate-900">{title}</h1>
        <p className="text-xs text-slate-500">PantryPal Operations & Management Center</p>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 text-xs font-semibold text-emerald-800">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>System Healthy</span>
        </div>

        <div className="flex items-center space-x-2 border-l pl-4 border-slate-200">
          <img
            src={user?.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
            alt="Admin"
            className="w-8 h-8 rounded-full object-cover border"
          />
          <div className="text-xs">
            <span className="font-bold text-slate-800 block leading-tight">{user?.name || 'Admin'}</span>
            <span className="text-[10px] text-slate-500">System Administrator</span>
          </div>
        </div>
      </div>
    </header>
  );
}
