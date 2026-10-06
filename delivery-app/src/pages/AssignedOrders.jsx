import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { deliveryAPI } from '../services/api';
import { Truck, MapPin, ChevronRight, Clock } from 'lucide-react';

export default function AssignedOrders() {
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await deliveryAPI.getAssignedOrders();
      if (res.data.success) {
        setDeliveries(res.data.data.deliveries);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const activeDeliveries = deliveries.filter((d) => ['ASSIGNED', 'ACCEPTED', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(d.status));

  return (
    <div className="pb-24 max-w-md mx-auto min-h-screen bg-gray-950 text-white">
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 sticky top-0 z-30">
        <h1 className="font-extrabold text-sm">Assigned Orders ({activeDeliveries.length})</h1>
      </div>

      <div className="px-4 py-4 space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="bg-gray-900 h-28 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : activeDeliveries.length === 0 ? (
          <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 text-center space-y-2">
            <Truck className="w-12 h-12 text-gray-700 mx-auto" />
            <h3 className="font-bold text-sm text-gray-300">No Assigned Deliveries</h3>
            <p className="text-xs text-gray-500">You will be notified when admin assigns a new delivery.</p>
          </div>
        ) : (
          activeDeliveries.map((del) => (
            <div
              key={del._id}
              onClick={() => navigate(`/workflow/${del._id}`)}
              className="bg-gray-900 rounded-2xl p-4 border border-gray-800 hover:border-emerald-500 transition cursor-pointer space-y-3"
            >
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-emerald-400">Order #{del.order?.orderNumber}</span>
                <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-bold">
                  {del.status}
                </span>
              </div>

              <div className="text-xs text-gray-300 space-y-1">
                <p className="font-bold text-white flex items-center">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 mr-1" />
                  {del.order?.customer?.name}
                </p>
                <p className="text-gray-400 text-[11px] truncate">
                  {del.deliveryLocation?.address}
                </p>
              </div>

              <div className="flex justify-between items-center pt-1 text-xs">
                <span className="text-emerald-400 font-bold">Payout: ₹{del.earningsAmount || 45}</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
