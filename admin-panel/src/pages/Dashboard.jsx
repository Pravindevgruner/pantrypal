import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { adminAPI } from '../services/api';
import { DollarSign, ShoppingBag, Truck, Users, AlertTriangle, ShieldAlert, ArrowUpRight, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const [metrics, setMetrics] = useState({});
  const [salesTrend, setSalesTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getDashboard();
      if (res.data.success) {
        setMetrics(res.data.data.metrics);
        setSalesTrend(res.data.data.salesTrend);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    { title: 'Total Revenue', value: `₹${metrics.totalRevenue || 0}`, icon: DollarSign, color: 'bg-emerald-500' },
    { title: "Today's Orders", value: metrics.todayOrders || 0, icon: ShoppingBag, color: 'bg-blue-500' },
    { title: 'Pending Deliveries', value: metrics.pendingOrders || 0, icon: Truck, color: 'bg-amber-500' },
    { title: 'Total Customers', value: metrics.totalCustomers || 0, icon: Users, color: 'bg-purple-500' },
    { title: 'Low Stock Items', value: metrics.lowStockCount || 0, icon: AlertTriangle, color: 'bg-orange-500' },
    { title: 'Expiring Soon Alert', value: metrics.expiringCount || 0, icon: ShieldAlert, color: 'bg-red-500' },
  ];

  return (
    <div className="flex-1 bg-slate-50 min-h-screen">
      <Header title="Admin Dashboard Overview" />

      <main className="p-6 space-y-6">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.title} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{c.title}</span>
                  <div className={`p-2 rounded-xl text-white ${c.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">{c.value}</h3>
              </div>
            );
          })}
        </div>

        {/* Visual Sales Trend Section */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center">
                <TrendingUp className="w-5 h-5 text-emerald-600 mr-2" />
                Sales & Revenue Trend (Last 7 Days)
              </h3>
              <p className="text-xs text-slate-500">Live order delivery revenue calculations</p>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 pt-4 border-t border-slate-100">
            {salesTrend.map((day) => (
              <div key={day.date} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center space-y-1">
                <span className="text-xs font-bold text-slate-700 block">{day.day}</span>
                <span className="text-[10px] text-slate-400 block">{day.date}</span>
                <div className="pt-2">
                  <span className="text-sm font-extrabold text-emerald-600 block">₹{day.revenue}</span>
                  <span className="text-[10px] text-slate-500 font-semibold">{day.orders} orders</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
