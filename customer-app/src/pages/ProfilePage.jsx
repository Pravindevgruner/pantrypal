import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { User, ShieldAlert, Package, Home, Heart, MapPin, Bell, LogOut, ChevronRight, Settings } from 'lucide-react';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div className="pb-24 max-w-md mx-auto min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <User className="w-16 h-16 text-emerald-600 mb-3" />
        <h2 className="text-lg font-bold text-gray-900">Sign in to your account</h2>
        <p className="text-xs text-gray-500 mt-1">Access order history, smart expiry alerts, and saved addresses.</p>
        <button
          onClick={() => navigate('/login')}
          className="mt-6 w-full max-w-xs bg-emerald-600 text-white text-xs font-bold py-3 rounded-xl shadow-md hover:bg-emerald-700"
        >
          Login / Register
        </button>
      </div>
    );
  }

  const menuItems = [
    { label: 'Smart Expiry Tracker', path: '/expiry', icon: ShieldAlert, color: 'text-amber-500', badge: 'Core Feature' },
    { label: 'Household Grocery Pantry', path: '/household-inventory', icon: Home, color: 'text-emerald-600' },
    { label: 'My Orders & Invoices', path: '/orders', icon: Package, color: 'text-blue-500' },
    { label: 'Wishlist', path: '/wishlist', icon: Heart, color: 'text-red-500' },
    { label: 'Saved Delivery Addresses', path: '/checkout', icon: MapPin, color: 'text-purple-500' },
    { label: 'Notifications', path: '/notifications', icon: Bell, color: 'text-amber-600' },
  ];

  return (
    <div className="pb-24 max-w-md mx-auto min-h-screen bg-gray-50">
      <Navbar />

      <div className="px-4 py-4 space-y-4">
        {/* User Card */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex items-center space-x-3">
          <img
            src={user.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
            alt={user.name}
            className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500 shadow-xs"
          />
          <div>
            <h2 className="font-extrabold text-base text-gray-900">{user.name}</h2>
            <p className="text-xs text-gray-500">{user.email}</p>
            <span className="mt-1 inline-block bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
              PantryPal Customer Member
            </span>
          </div>
        </div>

        {/* Action Menu List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs divide-y divide-gray-50 overflow-hidden">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                onClick={() => navigate(item.path)}
                className="p-3.5 flex items-center justify-between hover:bg-gray-50 transition cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-5 h-5 ${item.color}`} />
                  <span className="font-semibold text-xs text-gray-800">{item.label}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {item.badge && (
                    <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Logout Button */}
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="w-full bg-red-50 text-red-700 font-bold py-3.5 rounded-xl border border-red-200 hover:bg-red-100 transition flex items-center justify-center space-x-2 text-xs"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
