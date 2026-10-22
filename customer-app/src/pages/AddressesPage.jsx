import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { addressAPI } from '../services/api';
import { MapPin, Plus, Trash2, CheckCircle2, ArrowLeft, Home, Briefcase, Navigation } from 'lucide-react';

export default function AddressesPage() {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    houseFlat: '',
    street: '',
    area: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560103',
    type: 'Home',
    isDefault: false,
  });

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    setLoading(true);
    try {
      const res = await addressAPI.getAddresses();
      if (res.data.success) {
        setAddresses(res.data.data.addresses);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await addressAPI.createAddress(form);
      if (res.data.success) {
        setShowAddModal(false);
        setForm({
          fullName: '',
          phone: '',
          houseFlat: '',
          street: '',
          area: '',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560103',
          type: 'Home',
          isDefault: false,
        });
        loadAddresses();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save address');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await addressAPI.updateAddress(id, { isDefault: true });
      loadAddresses();
    } catch (err) {
      alert('Failed to set default address');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this delivery address?')) return;
    try {
      await addressAPI.deleteAddress(id);
      loadAddresses();
    } catch (err) {
      alert('Failed to delete address');
    }
  };

  const getTypeIcon = (type) => {
    if (type === 'Work') return <Briefcase className="w-4 h-4 text-blue-500" />;
    return <Home className="w-4 h-4 text-emerald-600" />;
  };

  return (
    <div className="pb-24 max-w-md mx-auto min-h-screen bg-gray-50">
      <Navbar />

      <div className="px-4 py-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigate('/profile')}
              className="p-1.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-100"
            >
              <ArrowLeft className="w-4 h-4 text-gray-700" />
            </button>
            <h1 className="font-extrabold text-base text-gray-900 flex items-center">
              <MapPin className="w-5 h-5 text-emerald-600 mr-1.5" />
              Saved Delivery Addresses
            </h1>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1 bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs hover:bg-emerald-700"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New</span>
          </button>
        </div>

        {/* Address List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white h-24 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200 p-6">
            <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <h3 className="font-bold text-gray-800 text-sm">No Addresses Saved</h3>
            <p className="text-xs text-gray-500 mt-1 mb-4">Add your home or office address for fast delivery.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl"
            >
              + Add Delivery Address
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((addr) => (
              <div
                key={addr._id}
                className={`bg-white p-4 rounded-2xl border transition relative ${
                  addr.isDefault ? 'border-emerald-500 shadow-xs ring-1 ring-emerald-500/20' : 'border-gray-100 shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="p-1.5 bg-gray-50 border border-gray-100 rounded-lg">
                      {getTypeIcon(addr.type)}
                    </span>
                    <span className="font-bold text-gray-900 text-xs">{addr.fullName}</span>
                    {addr.isDefault && (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center">
                        <CheckCircle2 className="w-3 h-3 mr-0.5" /> Default
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {!addr.isDefault && (
                      <button
                        onClick={() => handleSetDefault(addr._id)}
                        className="text-[10px] text-emerald-600 font-bold hover:underline"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(addr._id)}
                      className="p-1 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-2 text-xs text-gray-600 space-y-0.5">
                  <p className="font-medium text-gray-800">
                    {addr.houseFlat}, {addr.street && `${addr.street}, `}{addr.area}
                  </p>
                  <p>
                    {addr.city}, {addr.state} - <span className="font-mono">{addr.pincode}</span>
                  </p>
                  <p className="text-gray-500 text-[11px] mt-1">📞 {addr.phone}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Address Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-0 backdrop-blur-2xs">
          <div className="bg-white rounded-t-3xl p-5 w-full max-w-md max-h-[90vh] overflow-y-auto space-y-4 animate-in slide-in-from-bottom duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm flex items-center">
                <MapPin className="w-4 h-4 text-emerald-600 mr-1.5" />
                Add Delivery Address
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-700 text-xs font-bold"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Contact Name</label>
                  <input
                    type="text"
                    required
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    placeholder="Full name"
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="10-digit phone"
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">House / Flat / Block No.</label>
                <input
                  type="text"
                  required
                  value={form.houseFlat}
                  onChange={(e) => setForm({ ...form, houseFlat: e.target.value })}
                  placeholder="e.g. Flat 304, Green Heights"
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Street / Landmark</label>
                  <input
                    type="text"
                    value={form.street}
                    onChange={(e) => setForm({ ...form, street: e.target.value })}
                    placeholder="e.g. 12th Main Road"
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Area / Colony</label>
                  <input
                    type="text"
                    required
                    value={form.area}
                    onChange={(e) => setForm({ ...form, area: e.target.value })}
                    placeholder="e.g. Indiranagar"
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase">City</label>
                  <input
                    type="text"
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase">State</label>
                  <input
                    type="text"
                    required
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase">PIN Code</label>
                  <input
                    type="text"
                    required
                    value={form.pincode}
                    onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Address Type</label>
                <div className="flex space-x-2">
                  {['Home', 'Work', 'Other'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm({ ...form, type: t })}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl border ${
                        form.type === t
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-500'
                          : 'bg-white text-gray-600 border-gray-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center space-x-2 text-xs text-gray-700 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="font-medium">Set as default delivery address</span>
              </label>

              <button
                type="submit"
                className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 text-xs shadow-md mt-2"
              >
                Save Delivery Address
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
