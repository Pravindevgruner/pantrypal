import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import {
  User,
  ShieldAlert,
  Package,
  Home,
  Heart,
  MapPin,
  Bell,
  LogOut,
  ChevronRight,
  Edit2,
  X,
  Check,
} from 'lucide-react';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, setUser } = useAuth();

  const [showEditModal, setShowEditModal] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

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
    { label: 'Saved Delivery Addresses', path: '/addresses', icon: MapPin, color: 'text-purple-500' },
    { label: 'Notifications', path: '/notifications', icon: Bell, color: 'text-amber-600' },
  ];

  const handleOpenEdit = () => {
    setName(user.name || '');
    setPhone(user.phone || '');
    setProfileImage(user.profileImage || '');
    setMessage('');
    setShowEditModal(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await authAPI.updateProfile({ name, phone, profileImage });
      if (res.data.success) {
        setUser(res.data.data.user);
        setMessage('Profile updated successfully!');
        setTimeout(() => setShowEditModal(false), 900);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pb-24 max-w-md mx-auto min-h-screen bg-gray-50">
      <Navbar />

      <div className="px-4 py-4 space-y-4">
        {/* User Card */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={user.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
              alt={user.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500 shadow-xs"
            />
            <div>
              <h2 className="font-extrabold text-base text-gray-900">{user.name}</h2>
              <p className="text-xs text-gray-500">{user.email}</p>
              {user.phone ? (
                <p className="text-[11px] text-gray-400">📞 {user.phone}</p>
              ) : null}
              <span className="mt-1 inline-block bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                PantryPal Customer Member
              </span>
            </div>
          </div>

          <button
            onClick={handleOpenEdit}
            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl border border-emerald-100"
            title="Edit Profile"
          >
            <Edit2 className="w-4 h-4" />
          </button>
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

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-2xs">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm flex items-center">
                <Edit2 className="w-4 h-4 text-emerald-600 mr-1.5" />
                Edit Profile
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {message && (
              <div className="p-2.5 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl flex items-center">
                <Check className="w-3.5 h-3.5 mr-1" />
                {message}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-emerald-500 mt-0.5"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-emerald-500 mt-0.5"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">Profile Image URL</label>
                <input
                  type="url"
                  value={profileImage}
                  onChange={(e) => setProfileImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-emerald-500 mt-0.5"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-emerald-600 text-white font-bold py-2.5 rounded-xl hover:bg-emerald-700 text-xs shadow-md mt-2"
              >
                {saving ? 'Saving Changes...' : 'Update Profile'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
