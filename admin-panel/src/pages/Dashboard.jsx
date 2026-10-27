import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { adminAPI } from '../services/api';
import {
  DollarSign,
  ShoppingBag,
  Truck,
  Users,
  AlertTriangle,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
  Sparkles,
  PackageCheck,
  Zap,
  Activity,
  CheckCircle2,
  Clock,
  ChevronRight,
  Layers,
  Pause,
  Play,
  RotateCcw,
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({});
  const [pipeline, setPipeline] = useState({});
  const [salesTrend, setSalesTrend] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLiveActive, setIsLiveActive] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState('');
  const [actionMessage, setActionMessage] = useState(null);

  // Reference for polling interval
  const pollIntervalRef = useRef(null);

  // Initial load
  useEffect(() => {
    loadDashboard(true);
  }, []);

  // Real-time polling every 3 seconds
  useEffect(() => {
    if (isLiveActive) {
      pollIntervalRef.current = setInterval(() => {
        loadDashboard(false);
      }, 3000);
    } else {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    }

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [isLiveActive]);

  const loadDashboard = async (isFirstLoad = false) => {
    if (isFirstLoad) setLoading(true);
    else setIsRefreshing(true);

    try {
      const res = await adminAPI.getDashboard();
      if (res.data.success) {
        setMetrics(res.data.data.metrics || {});
        setPipeline(res.data.data.pipeline || {});
        setSalesTrend(res.data.data.salesTrend || []);
        setRecentOrders(res.data.data.recentOrders || []);
        setRecentActivities(res.data.data.recentActivities || []);
        setLastSyncTime(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error('Failed to sync admin metrics:', err);
    } finally {
      if (isFirstLoad) setLoading(false);
      setIsRefreshing(false);
    }
  };

  const showNotification = (msg, type = 'success') => {
    setActionMessage({ text: msg, type });
    setTimeout(() => setActionMessage(null), 4000);
  };

  // Quick Action: Simulate Live Customer Order
  const handleSimulateOrder = async () => {
    try {
      showNotification('Simulating live customer order...', 'info');
      const res = await adminAPI.simulateOrder();
      if (res.data.success) {
        showNotification(res.data.message || 'Simulated order placed in real-time!', 'success');
        loadDashboard(false);
      }
    } catch (err) {
      showNotification(err.response?.data?.message || 'Simulation failed', 'error');
    }
  };

  // Quick Action: Trigger Smart Expiry Scan
  const handleRunExpiryScan = async () => {
    try {
      showNotification('Running Smart Expiry monitoring cycle across all household pantries...', 'info');
      const res = await adminAPI.triggerExpiryScan();
      if (res.data.success) {
        showNotification('Smart Expiry Engine completed scan! Household freshness updated.', 'success');
        loadDashboard(false);
      }
    } catch (err) {
      showNotification(err.response?.data?.message || 'Expiry scan failed', 'error');
    }
  };

  // Quick Action: Bulk Restock Low Stock
  const handleBulkRestock = async () => {
    try {
      showNotification('Restocking all low-stock items in warehouse...', 'info');
      const res = await adminAPI.bulkRestock({ restockQuantity: 50 });
      if (res.data.success) {
        showNotification(res.data.message || 'Restocked low inventory items!', 'success');
        loadDashboard(false);
      }
    } catch (err) {
      showNotification(err.response?.data?.message || 'Bulk restock failed', 'error');
    }
  };

  const cards = [
    {
      title: 'Total Revenue',
      value: `₹${(metrics.totalRevenue || 0).toLocaleString()}`,
      subtext: `Today: ₹${metrics.todayRevenue || 0}`,
      icon: DollarSign,
      color: 'bg-emerald-600 text-white',
      border: 'border-emerald-200',
    },
    {
      title: "Today's Orders",
      value: metrics.todayOrders || 0,
      subtext: `Total Orders: ${metrics.totalOrders || 0}`,
      icon: ShoppingBag,
      color: 'bg-blue-600 text-white',
      border: 'border-blue-200',
    },
    {
      title: 'Active Deliveries',
      value: metrics.pendingOrders || 0,
      subtext: 'In processing / transit',
      icon: Truck,
      color: 'bg-amber-500 text-white',
      border: 'border-amber-200',
    },
    {
      title: 'Delivered Orders',
      value: metrics.completedOrders || 0,
      subtext: `Avg Order: ₹${metrics.avgOrderValue || 0}`,
      icon: PackageCheck,
      color: 'bg-teal-600 text-white',
      border: 'border-teal-200',
    },
    {
      title: 'Low Stock Alerts',
      value: metrics.lowStockCount || 0,
      subtext: `${metrics.outOfStockCount || 0} Out of Stock`,
      icon: AlertTriangle,
      color: 'bg-orange-500 text-white',
      border: 'border-orange-200',
    },
    {
      title: 'Expiring Soon',
      value: metrics.expiringCount || 0,
      subtext: `${metrics.freshCount || 0} Fresh items`,
      icon: ShieldAlert,
      color: 'bg-red-500 text-white',
      border: 'border-red-200',
    },
  ];

  const pipelineStages = [
    { key: 'PLACED', label: 'Placed', count: pipeline.PLACED || 0, color: 'bg-blue-100 text-blue-800 border-blue-300' },
    { key: 'CONFIRMED', label: 'Confirmed', count: pipeline.CONFIRMED || 0, color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
    { key: 'ASSIGNED', label: 'Assigned', count: pipeline.ASSIGNED || 0, color: 'bg-amber-100 text-amber-800 border-amber-300' },
    { key: 'PICKED_UP', label: 'Picked Up', count: pipeline.PICKED_UP || 0, color: 'bg-purple-100 text-purple-800 border-purple-300' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', count: pipeline.OUT_FOR_DELIVERY || 0, color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    { key: 'DELIVERED', label: 'Delivered', count: pipeline.DELIVERED || 0, color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    { key: 'CANCELLED', label: 'Cancelled', count: pipeline.CANCELLED || 0, color: 'bg-red-100 text-red-800 border-red-300' },
  ];

  return (
    <div className="flex-1 bg-slate-50 min-h-screen">
      <Header
        title="Admin Control Center & Real-Time Analytics"
        subtitle="Live streaming orders, warehouse inventory, delivery fleet & Smart Expiry monitoring"
        isLive={isLiveActive}
        lastSync={lastSyncTime}
        onRefresh={() => loadDashboard(false)}
        isRefreshing={isRefreshing}
      />

      <main className="p-6 space-y-6">
        {/* Banner Notification */}
        {actionMessage && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-bold flex items-center justify-between shadow-xs transition-all ${
              actionMessage.type === 'error'
                ? 'bg-red-50 border border-red-200 text-red-800'
                : actionMessage.type === 'info'
                ? 'bg-blue-50 border border-blue-200 text-blue-800'
                : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4" />
              <span>{actionMessage.text}</span>
            </div>
            <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-slate-600">
              ✕
            </button>
          </div>
        )}

        {/* Real-Time Control & Quick Actions Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className={`w-2.5 h-2.5 rounded-full ${isLiveActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
              <span className="text-xs font-bold text-slate-800">
                {isLiveActive ? 'Real-Time Sync: Active (3s)' : 'Real-Time Sync: Paused'}
              </span>
            </div>
            <button
              onClick={() => setIsLiveActive(!isLiveActive)}
              className="flex items-center space-x-1 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition"
            >
              {isLiveActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isLiveActive ? 'Pause' : 'Resume'}</span>
            </button>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={handleSimulateOrder}
              className="flex items-center space-x-1.5 px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-extrabold hover:opacity-95 shadow-xs transition"
            >
              <Zap className="w-4 h-4" />
              <span>Simulate Live Order</span>
            </button>

            <button
              onClick={handleRunExpiryScan}
              className="flex items-center space-x-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-extrabold shadow-xs transition"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Run Expiry Scan</span>
            </button>

            <button
              onClick={handleBulkRestock}
              className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-extrabold shadow-xs transition"
            >
              <PackageCheck className="w-4 h-4" />
              <span>Bulk Restock Low Stock</span>
            </button>
          </div>
        </div>

        {/* 6 Key Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.title}
                className={`bg-white p-4 rounded-2xl border ${c.border} shadow-xs space-y-2 relative overflow-hidden`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{c.title}</span>
                  <div className={`p-2 rounded-xl ${c.color} shadow-xs`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-slate-900">{c.value}</h3>
                <span className="text-[11px] font-semibold text-slate-500 block">{c.subtext}</span>
              </div>
            );
          })}
        </div>

        {/* Order Fulfillment Live Pipeline */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center">
              <Layers className="w-4 h-4 text-emerald-600 mr-2" />
              Live Order Fulfillment Pipeline ({metrics.totalOrders || 0} Orders)
            </h3>
            <span className="text-xs text-slate-400">Click any stage to inspect orders</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-1">
            {pipelineStages.map((st) => (
              <button
                key={st.key}
                onClick={() => navigate('/orders')}
                className={`p-3 rounded-xl border ${st.color} text-center space-y-1 hover:opacity-90 transition`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider block">{st.label}</span>
                <span className="text-xl font-black block">{st.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sales Trend Last 7 Days */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center">
                <TrendingUp className="w-5 h-5 text-emerald-600 mr-2" />
                Revenue & Daily Order Volume (Last 7 Days)
              </h3>
              <p className="text-xs text-slate-500">Live order delivery revenue calculations synced across web and mobile apps</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-400 block uppercase">Total Period Revenue</span>
              <span className="text-lg font-black text-emerald-600">₹{(metrics.totalRevenue || 0).toLocaleString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 pt-4 border-t border-slate-100">
            {salesTrend.map((day) => (
              <div key={day.date} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center space-y-1 hover:bg-slate-100 transition">
                <span className="text-xs font-bold text-slate-700 block">{day.day}</span>
                <span className="text-[10px] text-slate-400 block">{day.date}</span>
                <div className="pt-2">
                  <span className="text-sm font-extrabold text-emerald-600 block">₹{day.revenue}</span>
                  <span className="text-[10px] text-slate-500 font-semibold">{day.delivered || 0} delivered</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Operational Split View: Live Incoming Orders + Real-Time Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Live Recent Orders (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 flex items-center">
                  <ShoppingBag className="w-5 h-5 text-emerald-600 mr-2" />
                  Live Incoming Orders ({recentOrders.length})
                </h3>
                <p className="text-xs text-slate-500">Auto-updating live queue across mobile and web customer apps</p>
              </div>
              <button
                onClick={() => navigate('/orders')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center"
              >
                <span>View All Orders</span>
                <ChevronRight className="w-4 h-4 ml-0.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">Order</th>
                    <th className="p-2.5">Customer</th>
                    <th className="p-2.5">Items</th>
                    <th className="p-2.5">Total</th>
                    <th className="p-2.5">Payment</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-6 text-center text-slate-400">
                        No orders recorded yet. Click "Simulate Live Order" above to test!
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((o) => (
                      <tr key={o._id} className="hover:bg-slate-50 transition">
                        <td className="p-2.5 font-extrabold text-slate-900">#{o.orderNumber}</td>
                        <td className="p-2.5">
                          <span className="font-bold text-slate-800 block">{o.customer?.name || 'Customer'}</span>
                          <span className="text-[10px] text-slate-400">{o.address?.city || 'Bengaluru'}</span>
                        </td>
                        <td className="p-2.5 font-semibold text-slate-700">
                          {o.items?.length || 1} item(s)
                        </td>
                        <td className="p-2.5 font-black text-slate-900">₹{o.totalAmount}</td>
                        <td className="p-2.5">
                          <span className="bg-slate-100 text-slate-700 border px-1.5 py-0.5 rounded font-bold text-[10px]">
                            {o.paymentMethod} • {o.paymentStatus}
                          </span>
                        </td>
                        <td className="p-2.5">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              o.orderStatus === 'DELIVERED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : o.orderStatus === 'CANCELLED'
                                ? 'bg-red-100 text-red-800'
                                : o.orderStatus === 'OUT_FOR_DELIVERY'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {o.orderStatus}
                          </span>
                        </td>
                        <td className="p-2.5 text-right">
                          <button
                            onClick={() => navigate('/orders')}
                            className="px-2.5 py-1 bg-slate-900 text-white rounded-lg font-bold text-[10px] hover:bg-slate-800"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Real-Time Live System Activity Feed (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 flex items-center">
                  <Activity className="w-5 h-5 text-emerald-600 mr-2" />
                  Live System Activity
                </h3>
                <p className="text-xs text-slate-500">Real-time operations feed</p>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {recentActivities.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  Awaiting real-time system activities...
                </div>
              ) : (
                recentActivities.map((act) => (
                  <div key={act.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">{act.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-tight">{act.description}</p>
                    <div className="pt-1">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white border border-slate-300 text-slate-700">
                        {act.badge}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Smart Expiry & Wastage Summary Box */}
            <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-emerald-950 flex items-center">
                  <ShieldAlert className="w-3.5 h-3.5 text-emerald-700 mr-1" />
                  Food Wastage Prevention Rate
                </span>
                <span className="text-xs font-black text-emerald-800">{metrics.wastagePreventionRate || 100}%</span>
              </div>
              <div className="w-full bg-emerald-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-600 h-1.5 rounded-full"
                  style={{ width: `${metrics.wastagePreventionRate || 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] font-semibold text-emerald-800 pt-0.5">
                <span>{metrics.freshCount || 0} Fresh</span>
                <span>{metrics.expiringCount || 0} Expiring Soon</span>
                <span>{metrics.totalTrackedExpiry || 0} Total Tracked</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
