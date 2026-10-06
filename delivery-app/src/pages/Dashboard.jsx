import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { deliveryAPI } from '../services/api';
import { Truck, DollarSign, CheckCircle2, Clock, MapPin, ArrowRight, ShieldCheck, LogOut } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [deliveries, setDeliveries] = useState([]);
  const [earnings, setEarnings] = useState({ totalDeliveries: 0, totalEarnings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [delRes, earnRes] = await Promise.all([
        deliveryAPI.getAssignedOrders(),
        deliveryAPI.getEarnings(),
      ]);

      if (delRes.data.success) setDeliveries(delRes.data.data.deliveries);
      if (earnRes.data.success) setEarnings(earnRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const activeDeliveries = deliveries.filter((d) => ['ASSIGNED', 'ACCEPTED', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(d.status));
  const completedDeliveries = deliveries.filter((d) => d.status === 'DELIVERED');

  return (
    <div className="pb-24 max-w-md mx-auto min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-4 flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-emerald-500 text-gray-950 font-extrabold rounded-xl flex items-center justify-center">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Delivery Partner</span>
            <h1 className="font-extrabold text-sm">{user ? user.name : 'Partner Agent'}</h1>
          </div>
        </div>

        <button onClick={logout} className="p-2 text-gray-400 hover:text-red-400">
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Earnings Card */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-4 shadow-lg text-white space-y-2">
          <div className="flex justify-between items-center text-xs text-emerald-200">
            <span>Today's Total Earnings</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-full font-bold">Live</span>
          </div>
          <h2 className="text-3xl font-extrabold">₹{earnings.totalEarnings || 0}</h2>
          <div className="flex justify-between text-xs text-emerald-100 pt-2 border-t border-white/10">
            <span>Completed: {earnings.totalDeliveries || 0} Orders</span>
            <span>Avg Payout: ₹45/order</span>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div
            onClick={() => navigate('/orders')}
            className="bg-gray-900 border border-gray-800 p-3.5 rounded-2xl flex items-center justify-between cursor-pointer hover:border-emerald-500"
          >
            <div>
              <span className="text-gray-400 text-[11px]">Assigned Orders</span>
              <h3 className="text-xl font-extrabold text-emerald-400 mt-0.5">{activeDeliveries.length}</h3>
            </div>
            <Clock className="w-6 h-6 text-emerald-500" />
          </div>

          <div
            onClick={() => navigate('/history')}
            className="bg-gray-900 border border-gray-800 p-3.5 rounded-2xl flex items-center justify-between cursor-pointer hover:border-emerald-500"
          >
            <div>
              <span className="text-gray-400 text-[11px]">Completed</span>
              <h3 className="text-xl font-extrabold text-blue-400 mt-0.5">{completedDeliveries.length}</h3>
            </div>
            <CheckCircle2 className="w-6 h-6 text-blue-500" />
          </div>
        </div>

        {/* Active Delivery Workflow Queue */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-sm text-gray-200">Active Delivery Queue</h3>
            <button onClick={() => navigate('/orders')} className="text-xs text-emerald-400 font-bold hover:underline">
              View All
            </button>
          </div>

          {loading ? (
            <div className="bg-gray-900 h-28 rounded-2xl animate-pulse"></div>
          ) : activeDeliveries.length === 0 ? (
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 text-center space-y-2">
              <Truck className="w-10 h-10 text-gray-700 mx-auto" />
              <p className="text-xs text-gray-400">No active assigned deliveries right now.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeDeliveries.map((del) => (
                <div
                  key={del._id}
                  onClick={() => navigate(`/workflow/${del._id}`)}
                  className="bg-gray-900 rounded-2xl p-4 border border-gray-800 hover:border-emerald-500 transition cursor-pointer space-y-3 shadow-md"
                >
                  <div className="flex justify-between items-center text-xs border-b border-gray-800 pb-2">
                    <span className="font-extrabold text-emerald-400">Order #{del.order?.orderNumber}</span>
                    <span className="bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full text-[10px]">
                      {del.status}
                    </span>
                  </div>

                  <div className="text-xs space-y-1 text-gray-300">
                    <p className="font-bold text-white flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                      {del.order?.customer?.name || 'Customer'}
                    </p>
                    <p className="text-gray-400 text-[11px] truncate">
                      {del.deliveryLocation?.address || 'Customer Delivery Location'}
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-1 text-xs">
                    <span className="text-emerald-400 font-bold">Payout: ₹{del.earningsAmount || 45}</span>
                    <div className="flex items-center text-emerald-400 font-bold space-x-1">
                      <span>Process Delivery</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
