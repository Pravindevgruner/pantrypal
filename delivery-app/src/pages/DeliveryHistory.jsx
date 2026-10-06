import React, { useState, useEffect } from 'react';
import { deliveryAPI } from '../services/api';
import { CheckCircle2, History } from 'lucide-react';

export default function DeliveryHistory() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await deliveryAPI.getAssignedOrders();
      if (res.data.success) {
        setDeliveries(res.data.data.deliveries.filter((d) => d.status === 'DELIVERED'));
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
        <h1 className="font-extrabold text-sm flex items-center">
          <History className="w-4 h-4 text-emerald-400 mr-2" />
          Delivery History ({deliveries.length})
        </h1>
      </div>

      <div className="px-4 py-4 space-y-3">
        {loading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="bg-gray-900 h-20 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : deliveries.length === 0 ? (
          <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 text-center text-gray-500 text-xs">
            No completed delivery records.
          </div>
        ) : (
          deliveries.map((del) => (
            <div key={del._id} className="bg-gray-900 rounded-2xl p-3.5 border border-gray-800 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white">Order #{del.order?.orderNumber}</span>
                <span className="bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full text-[10px]">
                  DELIVERED
                </span>
              </div>
              <div className="flex justify-between text-gray-400 text-[11px]">
                <span>Customer: {del.order?.customer?.name}</span>
                <span>Payout: ₹{del.earningsAmount || 45}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
