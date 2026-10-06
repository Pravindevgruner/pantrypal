import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ExpiryBadge from '../components/ExpiryBadge';
import { expiryAPI } from '../services/api';
import { ShieldAlert, ShieldCheck, AlertTriangle, XCircle, CheckCircle2, Trash2, RefreshCw, BarChart2, PieChart } from 'lucide-react';

export default function SmartExpiryDashboard() {
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({});
  const [insights, setInsights] = useState({});
  const [activeTab, setActiveTab] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Consumption Modal
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionType, setActionType] = useState('CONSUME'); // 'CONSUME' or 'DISCARD'
  const [actionQty, setActionQty] = useState(1);

  useEffect(() => {
    loadExpiryData();
  }, [activeTab]);

  const loadExpiryData = async () => {
    setLoading(true);
    try {
      const [expRes, insRes] = await Promise.all([
        expiryAPI.getExpiryItems(),
        expiryAPI.getInsights(),
      ]);

      if (expRes.data.success) {
        setItems(expRes.data.data.items);
        setSummary(expRes.data.data.summary);
      }
      if (insRes.data.success) {
        setInsights(insRes.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunEngineCheck = async () => {
    try {
      await expiryAPI.runCheck();
      loadExpiryData();
      alert('Background expiry engine triggered successfully!');
    } catch (err) {
      console.error(err);
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
        {/* Header Title */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="font-extrabold text-lg text-gray-900 flex items-center">
              <ShieldAlert className="w-5 h-5 text-emerald-600 mr-1.5" />
              Smart Expiry Tracker
            </h1>
            <p className="text-xs text-gray-500">Automated shelf-life calculation & waste reduction engine</p>
          </div>
          <button
            onClick={handleRunEngineCheck}
            className="p-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition"
            title="Trigger Background Expiry Check"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Expiry Overview Metric Cards */}
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

        {/* Food Waste Insight Banner */}
        <div className="bg-emerald-900 text-white rounded-2xl p-4 shadow-sm relative overflow-hidden flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Food Waste Insights</span>
            <h4 className="font-extrabold text-sm mt-0.5">
              {insights.consumptionRate || 100}% Consumption Rate
            </h4>
            <p className="text-[11px] text-emerald-200 mt-0.5">
              Only {insights.wastePercentage || 0}% food waste recorded this month!
            </p>
          </div>
          <BarChart2 className="w-10 h-10 text-emerald-400 opacity-80" />
        </div>

        {/* Filter Chips */}
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

        {/* Items List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white h-24 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
            <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h3 className="font-bold text-gray-800 text-sm">No Grocery Items in {activeTab}</h3>
            <p className="text-xs text-gray-500 mt-1">Purchases automatically appear here with exact expiry countdowns!</p>
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
                      Purchased: {new Date(item.purchaseDate).toLocaleDateString()} | Shelf Life: {item.shelfLifeDays}d
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

      {/* Consume / Discard Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-xs space-y-4">
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
                  max={selectedItem.remainingQuantity || selectedItem.quantity}
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
