import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Grid, ShoppingBag, ShieldAlert, User } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function BottomTabs() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();

  const tabs = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Categories', path: '/categories', icon: Grid },
    { name: 'Cart', path: '/cart', icon: ShoppingBag, badge: cartCount },
    { name: 'Smart Expiry', path: '/expiry', icon: ShieldAlert, highlight: true },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/90 backdrop-blur-lg border-t border-gray-200 px-3 py-2 z-50 flex justify-around items-center shadow-lg">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = location.pathname === tab.path;

        return (
          <button
            key={tab.name}
            onClick={() => navigate(tab.path)}
            className={`relative flex flex-col items-center py-1 px-2 rounded-xl transition ${
              isActive
                ? tab.highlight
                  ? 'text-amber-600 font-bold'
                  : 'text-emerald-600 font-bold'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${tab.highlight && isActive ? 'animate-bounce' : ''}`} />
              {tab.badge > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-emerald-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5">{tab.name}</span>
          </button>
        );
      })}
    </div>
  );
}
