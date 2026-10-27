import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { adminAPI } from '../services/api';
import {
  ShieldAlert,
  BarChart3,
  PieChart,
  CheckCircle2,
  Trash2,
  TrendingUp,
  DollarSign,
  PackageCheck,
  Search,
  Filter,
  RefreshCw,
  Sparkles,
  Zap,
  Calendar,
  AlertTriangle,
} from 'lucide-react';

export default function Reports() {
  const [reports, setReports] = useState({});
  const [expiryItems, setExpiryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [activeTab, setActiveTab] = useState('EXPIRY'); // EXPIRY, ORDERS, FINANCIAL
  const [expiryStatusFilter, setExpiryStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadReportsData();
  }, []);

  const loadReportsData = async () => {
    setLoading(true);
    try {
      const [reportsRes, expiryRes] = await Promise.all([
        adminAPI.getReports(),
        adminAPI.getAllExpiry(),
      ]);

      if (reportsRes.data.success) {
        setReports(reportsRes.data.data || {});
      }
      if (expiryRes.data.success) {
        setExpiryItems(expiryRes.data.data.items || []);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerExpiryScan = async () => {
    setScanning(true);
    try {
      const res = await adminAPI.triggerExpiryScan();
      if (res.data.success) {
        alert('Smart Expiry Engine monitoring cycle completed! Household freshness data updated.');
        loadReportsData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Scan failed');
    } finally {
      setScanning(false);
    }
  };

  const expirySummary = reports.expirySummary || {};
  const ordersSummary = reports.ordersSummary || {};
  const paymentsSummary = reports.paymentsSummary || {};

  const filteredExpiry = expiryItems.filter((item) => {
    if (expiryStatusFilter !== 'ALL' && item.status !== expiryStatusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.productName?.toLowerCase().includes(q);
      const matchCustomer = item.customerId?.name?.toLowerCase().includes(q);
      return matchName || matchCustomer;
    }
    return true;
  });

  return (
    <div className="flex-1 bg-slate-50 min-h-screen">
      <Header
        title="Smart Expiry & Operations Analytics"
        subtitle="Real-time reports on food wastage prevention, household grocery freshness, order fulfillment & revenue"
        onRefresh={loadReportsData}
      />

      <main className="p-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div className="flex items-center space-x-2">
            {[
              { key: 'EXPIRY', label: 'Smart Expiry & Wastage Reduction' },
              { key: 'ORDERS', label: 'Fulfillment & Deliveries' },
              { key: 'FINANCIAL', label: 'Revenue & Payments' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === tab.key
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'EXPIRY' && (
            <button
              onClick={handleTriggerExpiryScan}
              disabled={scanning}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-bold hover:opacity-95 shadow-xs transition disabled:opacity-50"
            >
              <Zap className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
              <span>{scanning ? 'Running Engine...' : 'Run Expiry Engine Scan Now'}</span>
            </button>
          )}
        </div>

        {/* Tab 1: Smart Expiry Analytics */}
        {activeTab === 'EXPIRY' && (
          <div className="space-y-6">
            {/* Top Expiry Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-center shadow-xs">
                <span className="text-[11px] font-bold text-emerald-800 uppercase block">Fresh Items</span>
                <h4 className="text-3xl font-black text-emerald-950 mt-1">{expirySummary.fresh || 0}</h4>
                <span className="text-[10px] text-emerald-700 font-semibold block mt-1">Safe to consume</span>
              </div>
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-center shadow-xs">
                <span className="text-[11px] font-bold text-amber-800 uppercase block">Expiring Soon</span>
                <h4 className="text-3xl font-black text-amber-950 mt-1">{expirySummary.expiringSoon || 0}</h4>
                <span className="text-[10px] text-amber-700 font-semibold block mt-1">Countdown &lt; 3 days</span>
              </div>
              <div className="bg-red-50 border border-red-200 p-4 rounded-2xl text-center shadow-xs">
                <span className="text-[11px] font-bold text-red-800 uppercase block">Expired</span>
                <h4 className="text-3xl font-black text-red-950 mt-1">{expirySummary.expired || 0}</h4>
                <span className="text-[10px] text-red-700 font-semibold block mt-1">Requires inspection</span>
              </div>
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl text-center shadow-xs">
                <span className="text-[11px] font-bold text-blue-800 uppercase block">Consumed</span>
                <h4 className="text-3xl font-black text-blue-950 mt-1">{expirySummary.consumed || 0}</h4>
                <span className="text-[10px] text-blue-700 font-semibold block mt-1">Successfully eaten</span>
              </div>
              <div className="bg-purple-50 border border-purple-200 p-4 rounded-2xl text-center shadow-xs">
                <span className="text-[11px] font-bold text-purple-800 uppercase block">Wastage Prevention</span>
                <h4 className="text-3xl font-black text-purple-950 mt-1">{expirySummary.preventionRate || 100}%</h4>
                <span className="text-[10px] text-purple-700 font-semibold block mt-1">Sustainability score</span>
              </div>
            </div>

            {/* Platform Household Expiry Tracker Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
              <div className="flex justify-between items-center flex-wrap gap-3">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 flex items-center">
                    <ShieldAlert className="w-5 h-5 text-emerald-600 mr-2" />
                    Global Household Grocery Freshness Monitor
                  </h3>
                  <p className="text-xs text-slate-500">Live grocery inventory tracking in all customer homes</p>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search product or customer..."
                      className="bg-slate-50 border border-slate-200 pl-9 pr-3 py-1.5 rounded-xl text-xs font-semibold focus:outline-none"
                    />
                  </div>

                  <select
                    value={expiryStatusFilter}
                    onChange={(e) => setExpiryStatusFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold focus:outline-none"
                  >
                    <option value="ALL">All Freshness Status</option>
                    <option value="FRESH">Fresh Only</option>
                    <option value="EXPIRING_SOON">Expiring Soon</option>
                    <option value="EXPIRED">Expired</option>
                    <option value="CONSUMED">Consumed</option>
                    <option value="DISCARDED">Discarded</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Product Name</th>
                      <th className="p-3">Customer Household</th>
                      <th className="p-3">Quantity</th>
                      <th className="p-3">Purchased Date</th>
                      <th className="p-3">Expiry Date</th>
                      <th className="p-3 text-right">Freshness Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredExpiry.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-slate-400">
                          No tracked items match the selected filter.
                        </td>
                      </tr>
                    ) : (
                      filteredExpiry.map((item) => (
                        <tr key={item._id} className="hover:bg-slate-50 transition">
                          <td className="p-3">
                            <span className="font-bold text-slate-900 block">{item.productName}</span>
                            <span className="text-[10px] text-slate-400">Shelf life: {item.shelfLifeDays || 7} days</span>
                          </td>
                          <td className="p-3 font-semibold text-slate-700">
                            {item.customerId?.name || 'Customer'}
                          </td>
                          <td className="p-3 font-extrabold text-slate-900">
                            {item.quantity} {item.unit || 'pcs'}
                          </td>
                          <td className="p-3 text-slate-600 font-mono text-[11px]">
                            {new Date(item.purchaseDate).toLocaleDateString()}
                          </td>
                          <td className="p-3 font-mono text-[11px] font-bold text-slate-800">
                            {new Date(item.expiryDate).toLocaleDateString()}
                          </td>
                          <td className="p-3 text-right">
                            <span
                              className={`px-2.5 py-1 rounded-full font-bold text-[10px] inline-flex items-center ${
                                item.status === 'FRESH'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : item.status === 'EXPIRING_SOON'
                                  ? 'bg-amber-100 text-amber-800'
                                  : item.status === 'EXPIRED'
                                  ? 'bg-red-100 text-red-800'
                                  : item.status === 'CONSUMED'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Orders Fulfillment Analytics */}
        {activeTab === 'ORDERS' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="font-extrabold text-base text-slate-900">Fulfillment Rate</h3>
              <div className="flex items-center space-x-3">
                <span className="text-4xl font-black text-emerald-600">{ordersSummary.fulfillmentRate || 0}%</span>
                <span className="text-xs text-slate-500 leading-tight">Delivered vs total orders processed</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-emerald-600 h-2 rounded-full"
                  style={{ width: `${ordersSummary.fulfillmentRate || 0}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="font-extrabold text-base text-slate-900">Delivered Volume</h3>
              <span className="text-4xl font-black text-slate-900">{ordersSummary.delivered || 0}</span>
              <p className="text-xs text-slate-500">Orders successfully handed over by delivery fleet</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="font-extrabold text-base text-slate-900">Active In-Transit</h3>
              <span className="text-4xl font-black text-amber-600">{ordersSummary.active || 0}</span>
              <p className="text-xs text-slate-500">Orders currently assigned, picked up, or out for delivery</p>
            </div>
          </div>
        )}

        {/* Tab 3: Financial & Payment Reconciliation */}
        {activeTab === 'FINANCIAL' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="font-extrabold text-base text-slate-900">Delivered Gross Merchandise Value (GMV)</h3>
              <span className="text-4xl font-black text-emerald-600">
                ₹{(ordersSummary.totalRevenue || 0).toLocaleString()}
              </span>
              <p className="text-xs text-slate-500">Realized revenue from completed customer deliveries</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="font-extrabold text-base text-slate-900">Pending Receivables (COD / In-Transit)</h3>
              <span className="text-4xl font-black text-amber-600">
                ₹{(paymentsSummary.pendingAmount || 0).toLocaleString()}
              </span>
              <p className="text-xs text-slate-500">To be collected upon doorstep delivery verification</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
