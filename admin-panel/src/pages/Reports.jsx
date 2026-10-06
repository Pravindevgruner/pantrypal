import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { adminAPI } from '../services/api';
import { ShieldAlert, BarChart3, PieChart, CheckCircle2, Trash2 } from 'lucide-react';

export default function Reports() {
  const [reports, setReports] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getReports();
      if (res.data.success) {
        setReports(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const expirySummary = reports.expirySummary || {};
  const ordersSummary = reports.ordersSummary || {};

  return (
    <div className="flex-1 bg-slate-50 min-h-screen">
      <Header title="Smart Expiry & Food Wastage Analytics" />

      <main className="p-6 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 flex items-center">
            <ShieldAlert className="w-5 h-5 text-emerald-600 mr-2" />
            Smart Expiry System Global Analytics
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-center">
              <span className="text-[11px] font-bold text-emerald-800 uppercase block">Fresh Items</span>
              <h4 className="text-2xl font-extrabold text-emerald-950 mt-1">{expirySummary.fresh || 0}</h4>
            </div>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-center">
              <span className="text-[11px] font-bold text-amber-800 uppercase block">Expiring Soon</span>
              <h4 className="text-2xl font-extrabold text-amber-950 mt-1">{expirySummary.expiringSoon || 0}</h4>
            </div>
            <div className="bg-red-50 border border-red-200 p-4 rounded-2xl text-center">
              <span className="text-[11px] font-bold text-red-800 uppercase block">Expired</span>
              <h4 className="text-2xl font-extrabold text-red-950 mt-1">{expirySummary.expired || 0}</h4>
            </div>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl text-center">
              <span className="text-[11px] font-bold text-blue-800 uppercase block">Consumed</span>
              <h4 className="text-2xl font-extrabold text-blue-950 mt-1">{expirySummary.consumed || 0}</h4>
            </div>
            <div className="bg-slate-100 border border-slate-200 p-4 rounded-2xl text-center">
              <span className="text-[11px] font-bold text-slate-700 uppercase block">Discarded</span>
              <h4 className="text-2xl font-extrabold text-slate-900 mt-1">{expirySummary.discarded || 0}</h4>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-extrabold text-base text-slate-900">Order Delivery Metrics</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-2 border-b">
                <span>Total Orders Placed:</span>
                <span className="font-bold text-slate-900">{ordersSummary.total || 0}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span>Successfully Delivered:</span>
                <span className="font-bold text-emerald-600">{ordersSummary.delivered || 0}</span>
              </div>
              <div className="flex justify-between py-2">
                <span>Cancelled Orders:</span>
                <span className="font-bold text-red-600">{ordersSummary.cancelled || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-extrabold text-base text-slate-900">Razorpay Payment Metrics</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-2 border-b">
                <span>Total Verified Transactions:</span>
                <span className="font-bold text-slate-900">{reports.paymentsSummary?.totalTransactions || 0}</span>
              </div>
              <div className="flex justify-between py-2">
                <span>Total Processed Volume:</span>
                <span className="font-extrabold text-emerald-600">₹{reports.paymentsSummary?.successfulAmount || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
