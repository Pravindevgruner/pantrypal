import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { ShieldCheck, RefreshCw, Radio, Edit2, X, Check } from 'lucide-react';

export default function Header({
  title,
  subtitle = 'PantryPal Operations & Management Center',
  isLive = true,
  lastSync,
  onRefresh,
  isRefreshing = false,
}) {
  const { user, updateUserData } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    profileImage: '',
  });
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        phone: user.phone || '',
        profileImage: user.profileImage || '',
      });
    }
  }, [user]);

  const handleOpenEdit = () => {
    setForm({
      name: user?.name || '',
      phone: user?.phone || '',
      profileImage: user?.profileImage || '',
    });
    setSuccessMsg('');
    setErrorMsg('');
    setShowEditModal(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setErrorMsg('Name is required');
      return;
    }
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await authAPI.updateProfile(form);
      const updatedUser = res.data?.data?.user || res.data?.user || { ...user, ...form };
      if (updateUserData) {
        updateUserData(updatedUser);
      }
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => {
        setShowEditModal(false);
        setSuccessMsg('');
      }, 1000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

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
        <div
          onClick={handleOpenEdit}
          title="Click to Edit Profile"
          className="flex items-center space-x-2 border-l pl-3 border-slate-200 cursor-pointer hover:bg-slate-50 py-1 px-2 rounded-xl transition group"
        >
          <img
            src={user?.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
            alt="Admin"
            className="w-8 h-8 rounded-full object-cover border border-slate-200 group-hover:border-emerald-500 transition"
          />
          <div className="text-xs">
            <span className="font-bold text-slate-800 block leading-tight group-hover:text-emerald-700 transition flex items-center">
              {user?.name || 'Admin'}
              <Edit2 className="w-3 h-3 ml-1 text-slate-400 group-hover:text-emerald-600 transition" />
            </span>
            <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Super Administrator</span>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Edit Admin Profile</h3>
                  <p className="text-[11px] text-slate-500">Update your administrator details</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center">
                <Check className="w-4 h-4 mr-2 text-emerald-600" />
                {successMsg}
              </div>
            )}

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-bold rounded-xl">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-emerald-500 font-medium"
                  placeholder="Admin Name"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-emerald-500 font-medium font-mono"
                  placeholder="+91 9876543210"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Profile Avatar Image URL</label>
                <input
                  type="url"
                  value={form.profileImage}
                  onChange={(e) => setForm({ ...form, profileImage: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-emerald-500 font-medium text-slate-600"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition disabled:opacity-50 flex items-center space-x-1.5"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
