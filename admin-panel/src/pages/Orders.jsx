import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { orderAPI, adminAPI } from '../services/api';
import { Truck, UserCheck, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [assignPartnerId, setAssignPartnerId] = useState('');
  const [newStatus, setNewStatus] = useState('DELIVERED');

  useEffect(() => {
    loadOrders();
    loadPartners();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await orderAPI.getAllOrders();
      if (res.data.success) {
        setOrders(res.data.data.orders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadPartners = async () => {
    try {
      const res = await adminAPI.getUsers({ role: 'DELIVERY_PARTNER' });
      if (res.data.success) {
        setPartners(res.data.data.users);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (orderId, status, partnerId) => {
    try {
      await orderAPI.updateOrderStatus(orderId, {
        status,
        deliveryPartnerId: partnerId || undefined,
      });
      setSelectedOrder(null);
      loadOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="flex-1 bg-slate-50 min-h-screen">
      <Header title="Order Processing & Partner Assignment" />

      <main className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-extrabold text-lg text-slate-900">All Orders ({orders.length})</h2>
            <p className="text-xs text-slate-500">Monitor live customer orders & assign delivery agents</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3">Order ID</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Total Amount</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Assigned Partner</th>
                <th className="p-3">Order Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((o) => (
                <tr key={o._id} className="hover:bg-slate-50">
                  <td className="p-3 font-extrabold text-slate-900">#{o.orderNumber}</td>
                  <td className="p-3">
                    <span className="font-bold text-slate-800 block">{o.customer?.name || 'Customer'}</span>
                    <span className="text-[10px] text-slate-400">{o.address?.city}</span>
                  </td>
                  <td className="p-3 font-extrabold text-slate-900">₹{o.totalAmount}</td>
                  <td className="p-3">
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-bold text-[10px]">
                      {o.paymentMethod} ({o.paymentStatus})
                    </span>
                  </td>
                  <td className="p-3 font-semibold text-slate-700">
                    {o.deliveryPartner ? (
                      <span className="text-slate-900 font-bold flex items-center">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                        {o.deliveryPartner.name}
                      </span>
                    ) : (
                      <span className="text-amber-600 font-bold text-[10px]">Unassigned</span>
                    )}
                  </td>
                  <td className="p-3">
                    <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-full font-bold text-[10px]">
                      {o.orderStatus}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => {
                        setSelectedOrder(o);
                        setAssignPartnerId(o.deliveryPartner?._id || (partners[0]?._id || ''));
                        setNewStatus(o.orderStatus);
                      }}
                      className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl font-bold text-[11px] hover:bg-emerald-700 shadow-xs"
                    >
                      Manage Order
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Manage Order Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="font-bold text-slate-900 text-base">
              Manage Order #{selectedOrder.orderNumber}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assign Delivery Partner</label>
                <select
                  value={assignPartnerId}
                  onChange={(e) => setAssignPartnerId(e.target.value)}
                  className="w-full bg-slate-50 border p-2.5 rounded-xl font-semibold"
                >
                  <option value="">Select Partner...</option>
                  {partners.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Update Order Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-slate-50 border p-2.5 rounded-xl font-semibold"
                >
                  <option value="PLACED">PLACED</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="ASSIGNED">ASSIGNED</option>
                  <option value="PICKED_UP">PICKED UP</option>
                  <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                  <option value="DELIVERED">DELIVERED (Triggers Smart Expiry)</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 py-2.5 border rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedOrder._id, newStatus, assignPartnerId)}
                  className="flex-1 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700"
                >
                  Apply Status Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
