import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Truck, History, DollarSign, User } from 'lucide-react';

export default function BottomTabs() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Orders', path: '/orders', icon: Truck },
    { name: 'Earnings', path: '/earnings', icon: DollarSign },
    { name: 'History', path: '/history', icon: History },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-gray-900 border-t border-gray-800 text-white px-3 py-2 z-50 flex justify-around items-center shadow-2xl">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = location.pathname === tab.path;

        return (
          <button
            key={tab.name}
            onClick={() => navigate(tab.path)}
            className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
              isActive ? 'text-emerald-400 font-extrabold scale-105' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">{tab.name}</span>
          </button>
        );
      })}
    </div>
  );
}
