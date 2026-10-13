import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ExpiryBadge from '../components/ExpiryBadge';
import { expiryAPI, productAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Trash2,
  RefreshCw,
  BarChart2,
  Plus,
  Sparkles,
  Calendar,
  Home
} from 'lucide-react';
import dayjs from 'dayjs';

export default function SmartExpiryDashboard() {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({});
  const [insights, setInsights] = useState({});
  const [activeTab, setActiveTab] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Consumption Modal
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionType, setActionType] = useState('CONSUME'); // 'CONSUME' or 'DISCARD'
  const [actionQty, setActionQty] = useState(1);

  // Add Item Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [productsList, setProductsList] = useState([]);
  const [newItem, setNewItem] = useState({
    productName: '',
    quantity: 1,
    unit: 'pcs',
    shelfLifeDays: 7,
    purchaseDate: dayjs().format('YYYY-MM-DD'),
  });

  useEffect(() => {
    if (user) {
      loadExpiryData();
      loadCatalog();
    } else {
      setLoading(false);
    }
  }, [user, activeTab]);

  const loadExpiryData = async () => {
    setLoading(true);
    try {
      const [expRes, insRes] = await Promise.all([
        expiryAPI.getExpiryItems({ status: activeTab !== 'ALL' ? activeTab : undefined }),
        expiryAPI.getInsights(),
      ]);

      if (expRes.data.success) {
        setItems(expRes.data.data.items);
        setSummary(expRes.data.data.summary || {});
      }
      if (insRes.data.success) {
        setInsights(insRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load expiry data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCatalog = async () => {
    try {
      const res = await productAPI.getProducts({ limit: 20 });
      if (res.data.success) {
        setProductsList(res.data.data.products);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickDemoLogin = async () => {
    try {
      await login('customer@example.com', 'password123');
    } catch (err) {
      alert('Login error. Please try logging in via the Login page.');
    }
  };

  const handleRunEngineCheck = async () => {
    setRefreshing(true);
    try {
      await expiryAPI.runCheck();
      await loadExpiryData();
      alert('Smart Expiry Engine scan completed! Statuses and reminders updated.');
    } catch (err) {
      console.error(err);
      alert('Error running expiry check');
    } finally {
      setRefreshing(false);
    }
  };

  const handleActionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      if (actionType === 'CONSUME') {
        await expiryAPI.consumeItem(selectedItem._id, actionQty);
      } else {
        await expiryAPI.discardItem(selectedItem._id, actionQty);
      }
      setSelectedItem(null);
      loadExpiryData();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      await expiryAPI.addExpiryItem({
        productName: newItem.productName,
        quantity: Number(newItem.quantity) || 1,
        unit: newItem.unit || 'pcs',
        shelfLifeDays: Number(newItem.shelfLifeDays) || 7,
        purchaseDate: newItem.purchaseDate,
      });
      setShowAddModal(false);
      setNewItem({
        productName: '',
        quantity: 1,
        unit: 'pcs',
        shelfLifeDays: 7,
        purchaseDate: dayjs().format('YYYY-MM-DD'),
      });
      loadExpiryData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add item');
    }
  };

  const filteredItems = items.filter((item) => {
    if (activeTab === 'FRESH') return item.status === 'FRESH';
    if (activeTab === 'EXPIRING_SOON') return item.status === 'EXPIRING_SOON';
    if (activeTab === 'EXPIRED') return item.status === 'EXPIRED';
    if (activeTab === 'CONSUMED') return item.status === 'CONSUMED';
    if (activeTab === 'DISCARDED') return item.status === 'DISCARDED';
    return true;
  });

  return (
    <div className="pb-28 max-w-md mx-auto min-h-screen bg-gray-50">
      <Navbar />

      <div className="px-4 py-4 space-y-4">
        {/* Header Title and Actions */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="font-extrabold text-lg text-gray-900 flex items-center">
              <ShieldAlert className="w-5 h-5 text-emerald-600 mr-1.5" />
              Smart Expiry Tracker
            </h1>
            <p className="text-xs text-gray-500">Automated shelf-life calculation & waste reduction engine</p>
          </div>

          <div className="flex items-center space-x-2">
            {user && (
              <>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs hover:bg-emerald-700 transition"
                  title="Add Item"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={handleRunEngineCheck}
                  disabled={refreshing}
                  className="p-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition"
                  title="Run Expiry Background Scan"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* User Not Logged In Banner */}
        {!user && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-start space-x-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-sm text-amber-900">Sign in to view your Smart Expiry tracker</h3>
                <p className="text-xs text-amber-800 mt-0.5">
                  Sign in as customer to access pre-seeded tracked items, expiry countdown alerts, and waste insights!
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleQuickDemoLogin}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center space-x-1 shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>1-Click Demo Login</span>
              </button>
              <button
                onClick={() => navigate('/login')}
                className="py-2 px-3 bg-white border border-amber-300 text-amber-900 font-bold rounded-xl text-xs"
              >
                Sign In
              </button>
            </div>
          </div>
        )}

        {/* Expiry Overview Metric Cards */}
        {user && (
          <div className="grid grid-cols-3 gap-2 text-center">
            <div
              onClick={() => setActiveTab('FRESH')}
              className={`p-3 rounded-2xl border cursor-pointer transition ${
                activeTab === 'FRESH' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-gray-800 border-gray-100'
              }`}
            >
              <ShieldCheck className={`w-5 h-5 mx-auto mb-1 ${activeTab === 'FRESH' ? 'text-white' : 'text-emerald-600'}`} />
              <span className="text-lg font-extrabold block">{summary.freshCount || 0}</span>
              <span className="text-[10px] font-medium">Fresh Items</span>
            </div>

            <div
              onClick={() => setActiveTab('EXPIRING_SOON')}
              className={`p-3 rounded-2xl border cursor-pointer transition ${
                activeTab === 'EXPIRING_SOON' ? 'bg-amber-500 text-white shadow-md' : 'bg-white text-gray-800 border-gray-100'
              }`}
            >
              <AlertTriangle className={`w-5 h-5 mx-auto mb-1 ${activeTab === 'EXPIRING_SOON' ? 'text-white' : 'text-amber-500'}`} />
              <span className="text-lg font-extrabold block">{summary.expiringSoonCount || 0}</span>
              <span className="text-[10px] font-medium">Expiring Soon</span>
            </div>

            <div
              onClick={() => setActiveTab('EXPIRED')}
              className={`p-3 rounded-2xl border cursor-pointer transition ${
                activeTab === 'EXPIRED' ? 'bg-red-600 text-white shadow-md' : 'bg-white text-gray-800 border-gray-100'
              }`}
            >
              <XCircle className={`w-5 h-5 mx-auto mb-1 ${activeTab === 'EXPIRED' ? 'text-white' : 'text-red-500'}`} />
              <span className="text-lg font-extrabold block">{summary.expiredCount || 0}</span>
              <span className="text-[10px] font-medium">Expired</span>
            </div>
          </div>
        )}

        {/* Food Waste Insight Banner */}
        {user && (
          <div className="bg-emerald-900 text-white rounded-2xl p-4 shadow-sm relative overflow-hidden flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Food Waste Insights</span>
              <h4 className="font-extrabold text-sm mt-0.5">
                {insights.consumptionRate || 100}% Consumption Rate
              </h4>
              <p className="text-[11px] text-emerald-200 mt-0.5">
                {insights.totalConsumed || 0} items consumed • Only {insights.wastePercentage || 0}% food waste recorded!
              </p>
            </div>
            <BarChart2 className="w-10 h-10 text-emerald-400 opacity-80" />
          </div>
        )}

        {/* Filter Chips */}
        {user && (
          <div className="flex space-x-2 overflow-x-auto no-scrollbar py-1 text-xs">
            {['ALL', 'FRESH', 'EXPIRING_SOON', 'EXPIRED', 'CONSUMED', 'DISCARDED'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition ${
                  activeTab === tab
                    ? 'bg-gray-900 text-white shadow-xs'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                {tab.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        )}

        {/* Items List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white h-24 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : !user ? null : filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200 p-6 space-y-3">
            <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto" />
            <div>
              <h3 className="font-bold text-gray-800 text-sm">No Grocery Items in {activeTab}</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                Purchases automatically appear here with exact expiry countdowns! You can also tap "+ Add Item" above.
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl"
            >
              Add Item to Tracker
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-2xl p-3 border border-gray-100 shadow-xs flex items-center justify-between"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <img
                    src={item.productImage || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80'}
                    alt={item.productName}
                    className="w-14 h-14 object-cover rounded-xl border border-gray-100 flex-shrink-0"
                  />

                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 text-xs truncate">{item.productName}</h3>
                    <div className="mt-1">
                      <ExpiryBadge status={item.status} daysRemaining={item.daysRemaining} />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">
                      Purchased: {dayjs(item.purchaseDate).format('MMM D, YYYY')} • Shelf Life: {item.shelfLifeDays}d
                    </p>
                    <p className="text-[10px] text-gray-500">
                      Remaining: {item.remainingQuantity !== undefined ? item.remainingQuantity : item.quantity} {item.unit || 'pcs'}
                    </p>
                  </div>
                </div>

                {/* Actions Button */}
                {['FRESH', 'EXPIRING_SOON', 'EXPIRED'].includes(item.status) && (
                  <div className="flex flex-col space-y-1">
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setActionType('CONSUME');
                        setActionQty(1);
                      }}
                      className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-bold hover:bg-emerald-100"
                    >
                      Consume
                    </button>
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setActionType('DISCARD');
                        setActionQty(1);
                      }}
                      className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-lg text-[10px] font-bold hover:bg-red-100"
                    >
                      Discard
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm space-y-4 my-8">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-gray-900 text-sm">Add Item to Smart Expiry Tracker</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-sm font-bold">
                ✕
              </button>
            </div>

            {/* Quick Pick from Catalog */}
            {productsList.length > 0 && (
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Pick from Catalog
                </label>
                <div className="flex space-x-1.5 overflow-x-auto no-scrollbar py-1">
                  {productsList.slice(0, 6).map((prod) => (
                    <button
                      key={prod._id}
                      type="button"
                      onClick={() => {
                        setNewItem({
                          ...newItem,
                          productName: prod.name,
                          shelfLifeDays: prod.shelfLifeDays || 7,
                          unit: prod.unit || 'pcs',
                        });
                      }}
                      className="flex-shrink-0 text-[10px] bg-gray-100 hover:bg-emerald-50 hover:text-emerald-800 border px-2 py-1 rounded-lg font-semibold"
                    >
                      {prod.name.split(' ')[0]} ({prod.shelfLifeDays}d)
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleAddItem} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Whole Wheat Bread"
                  value={newItem.productName}
                  onChange={(e) => setNewItem({ ...newItem, productName: e.target.value })}
                  className="w-full bg-gray-50 border p-2.5 rounded-xl focus:outline-emerald-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                    className="w-full bg-gray-50 border p-2.5 rounded-xl focus:outline-emerald-500 font-bold text-center"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Unit</label>
                  <select
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    className="w-full bg-gray-50 border p-2.5 rounded-xl focus:outline-emerald-500"
                  >
                    <option value="pcs">pcs</option>
                    <option value="pack">pack</option>
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="L">L</option>
                    <option value="bottle">bottle</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Shelf Life (Days)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newItem.shelfLifeDays}
                    onChange={(e) => setNewItem({ ...newItem, shelfLifeDays: e.target.value })}
                    className="w-full bg-amber-50 border border-amber-300 p-2.5 rounded-xl focus:outline-amber-500 font-extrabold text-amber-900 text-center"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Purchase Date</label>
                  <input
                    type="date"
                    required
                    value={newItem.purchaseDate}
                    onChange={(e) => setNewItem({ ...newItem, purchaseDate: e.target.value })}
                    className="w-full bg-gray-50 border p-2.5 rounded-xl focus:outline-emerald-500 text-[11px]"
                  />
                </div>
              </div>

              <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-100 text-[11px] text-emerald-900 flex items-center justify-between">
                <span>Calculated Expiry:</span>
                <span className="font-extrabold">
                  {dayjs(newItem.purchaseDate).add(Number(newItem.shelfLifeDays) || 7, 'day').format('MMM D, YYYY')}
                </span>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border rounded-xl font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-sm"
                >
                  Start Tracking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Consume / Discard Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-xs space-y-4">
            <h3 className="font-bold text-gray-900 text-sm">
              {actionType === 'CONSUME' ? 'Mark as Consumed' : 'Mark as Discarded'}
            </h3>
            <p className="text-xs text-gray-500">
              Product: <span className="font-bold text-gray-800">{selectedItem.productName}</span>
            </p>

            <form onSubmit={handleActionSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  max={selectedItem.remainingQuantity !== undefined ? selectedItem.remainingQuantity : selectedItem.quantity}
                  value={actionQty}
                  onChange={(e) => setActionQty(Number(e.target.value))}
                  className="w-full bg-gray-50 border p-2 rounded-xl focus:outline-emerald-500 font-bold text-center"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="flex-1 py-2 border rounded-xl font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-2 text-white font-bold rounded-xl ${
                    actionType === 'CONSUME' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
