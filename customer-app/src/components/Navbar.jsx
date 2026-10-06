import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Bell, MapPin, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar({ onSearchChange, searchValue }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartCount } = useCart();

  return (
    <header className="sticky top-0 bg-white border-b border-gray-100 z-40 px-4 py-3 shadow-xs">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="bg-emerald-600 text-white p-1.5 rounded-xl shadow-xs">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight text-gray-900 leading-none">
              Pantry<span className="text-emerald-600">Pal</span>
            </h1>
            <p className="text-[10px] text-gray-500 font-medium">Smart Grocery & Expiry Delivery</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/notifications')}
            className="relative p-2 text-gray-600 hover:text-emerald-600 rounded-full bg-gray-50 hover:bg-emerald-50 transition"
          >
            <Bell className="w-5 h-5" />
          </button>
          {user ? (
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center space-x-1 pl-1 pr-2 py-1 bg-gray-100 rounded-full text-xs font-semibold text-gray-700 hover:bg-gray-200"
            >
              <img
                src={user.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                alt={user.name}
                className="w-6 h-6 rounded-full object-cover"
              />
              <span className="truncate max-w-[80px]">{user.name.split(' ')[0]}</span>
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs hover:bg-emerald-700"
            >
              Login
            </button>
          )}
        </div>
      </div>

      {/* Location Bar */}
      <div className="flex items-center text-xs text-gray-600 mb-2 bg-emerald-50/50 p-2 rounded-xl border border-emerald-100/60">
        <MapPin className="w-4 h-4 text-emerald-600 mr-1 flex-shrink-0" />
        <span className="font-semibold text-gray-900 mr-1">Deliver to:</span>
        <span className="truncate text-gray-600">Flat 402, Sunshine Apartments, Connaught Place</span>
      </div>

      {/* Search Input */}
      {onSearchChange !== undefined && (
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search fresh groceries, milk, vegetables..."
            value={searchValue || ''}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-gray-100 pl-9 pr-4 py-2 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          />
        </div>
      )}
    </header>
  );
}
