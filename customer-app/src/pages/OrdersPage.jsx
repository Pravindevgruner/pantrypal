import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { orderAPI } from '../services/api';
import { Package, Clock, ChevronRight, CheckCircle2, Truck, XCircle } from 'lucide-react';

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await orderAPI.getOrders();
      if (res.data.success) {
        setOrders(res.data.data.orders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'DELIVERED')
      return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center"><CheckCircle2 className="w-3 h-3 mr-1" /> Delivered</span>;
    if (status === 'CANCELLED')
      return <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center"><XCircle className="w-3 h-3 mr-1" /> Cancelled</span>;
    return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center"><Truck className="w-3 h-3 mr-1 animate-pulse" /> {status.replace(/_/g, ' ')}</span>;
  };

  return (
    <div className="pb-24 max-w-md mx-auto min-h-screen bg-gray-50">
      <Navbar />

      <div className="px-4 py-4 space-y-4">
        <h2 className="font-extrabold text-base text-gray-900">Order History</h2>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white h-32 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200 p-6">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <h3 className="font-bold text-gray-800 text-sm">No Orders Yet</h3>
            <p className="text-xs text-gray-500 mt-1">Place your first grocery order to track deliveries and smart expiry!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order._id}
                onClick={() => navigate(`/orders/${order._id}`)}
                className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs hover:shadow-md transition cursor-pointer space-y-3"
              >
                <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                  <div>
                    <span className="font-extrabold text-xs text-gray-900">#{order.orderNumber}</span>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {new Date(order.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                  {getStatusBadge(order.orderStatus)}
                </div>

                <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
                  {order.items?.map((item, idx) => (
                    <img
                      key={idx}
                      src={item.productImage || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80'}
                      alt={item.productName}
                      className="w-10 h-10 object-cover rounded-lg border border-gray-100 flex-shrink-0"
                    />
                  ))}
                </div>

                <div className="flex justify-between items-center pt-1 text-xs">
                  <span className="text-gray-500 font-medium">{order.items?.length} items</span>
                  <div className="flex items-center space-x-1">
                    <span className="font-extrabold text-gray-900">₹{order.totalAmount}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
