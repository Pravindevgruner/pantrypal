import React, { useState, useEffect } from 'react';
import { deliveryAPI } from '../services/api';
import { DollarSign, CheckCircle2, Award } from 'lucide-react';

export default function Earnings() {
  const [data, setData] = useState({ totalDeliveries: 0, totalEarnings: 0, deliveries: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEarnings();
  }, []);

  const loadEarnings = async () => {
    setLoading(true);
    try {
      const res = await deliveryAPI.getEarnings();
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-24 max-w-md mx-auto min-h-screen bg-gray-950 text-white">
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 sticky top-0 z-30">
        <h1 className="font-extrabold text-sm">Earnings Summary</h1>
      </div>

      <div className="px-4 py-4 space-y-4">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-5 shadow-lg space-y-2">
          <span className="text-emerald-200 text-xs font-bold uppercase tracking-wider">Total Accumulated Earnings</span>
          <h2 className="text-3xl font-extrabold text-white">₹{data.totalEarnings}</h2>
          <p className="text-xs text-emerald-100">Total Completed Deliveries: {data.totalDeliveries}</p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 space-y-3 text-xs">
          <h3 className="font-bold text-gray-300">Completed Deliveries Payout Log</h3>

          {data.deliveries.length === 0 ? (
            <p className="text-gray-500 py-4 text-center">No completed deliveries yet.</p>
          ) : (
            <div className="divide-y divide-gray-800">
              {data.deliveries.map((del) => (
                <div key={del._id} className="py-2.5 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white">Order #{del.order?.orderNumber}</span>
                    <p className="text-[10px] text-gray-400">
                      {new Date(del.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="font-extrabold text-emerald-400">+₹{del.earningsAmount || 45}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
