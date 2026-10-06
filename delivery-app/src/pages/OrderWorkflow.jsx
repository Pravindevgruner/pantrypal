import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { deliveryAPI } from '../services/api';
import { ArrowLeft, MapPin, Phone, CheckCircle2, Navigation, Truck, PackageCheck } from 'lucide-react';

export default function OrderWorkflow() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDelivery();
  }, [id]);

  const loadDelivery = async () => {
    setLoading(true);
    try {
      const res = await deliveryAPI.getAssignedOrders();
      if (res.data.success) {
        const found = res.data.data.deliveries.find((d) => d._id === id);
        setDelivery(found || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    try {
      await deliveryAPI.acceptOrder(id);
      loadDelivery();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  const handleReject = async () => {
    if (!window.confirm('Reject this delivery order?')) return;
    try {
      await deliveryAPI.rejectOrder(id);
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      await deliveryAPI.updateStatus(id, newStatus);
      loadDelivery();
      if (newStatus === 'DELIVERED') {
        alert('Order delivered successfully! Smart Expiry records activated for customer.');
        navigate('/history');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Status update failed');
    }
  };

  if (loading) {
    return <div className="max-w-md mx-auto min-h-screen bg-gray-950 p-4 animate-pulse"></div>;
  }

  if (!delivery) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-gray-950 p-6 text-center text-white">
        <p className="text-sm font-semibold">Delivery record not found</p>
      </div>
    );
  }

  const order = delivery.order || {};
  const customer = order.customer || {};

  return (
    <div className="pb-24 max-w-md mx-auto min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 sticky top-0 z-30 flex items-center space-x-3">
        <button onClick={() => navigate(-1)} className="p-1 text-gray-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-extrabold text-sm">Delivery Workflow</h1>
          <p className="text-[10px] text-gray-400">Order #{order.orderNumber}</p>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Status Badge */}
        <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800 flex justify-between items-center text-xs">
          <div>
            <span className="text-gray-400 text-[10px] uppercase font-bold">Current Delivery Status</span>
            <h3 className="font-extrabold text-emerald-400 text-sm">{delivery.status}</h3>
          </div>
          <span className="bg-emerald-500/20 text-emerald-300 font-extrabold px-3 py-1 rounded-full text-xs">
            Payout: ₹{delivery.earningsAmount || 45}
          </span>
        </div>

        {/* Map Location Preview Simulation */}
        <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 space-y-3 text-xs">
          <h3 className="font-bold text-gray-300 flex items-center">
            <Navigation className="w-4 h-4 text-emerald-400 mr-1.5" />
            Route Navigation Details
          </h3>

          <div className="space-y-2">
            <div className="p-3 bg-gray-800/60 rounded-xl border border-gray-700">
              <span className="text-[10px] font-bold text-emerald-400 uppercase">Pickup Hub</span>
              <p className="font-bold text-white mt-0.5">{delivery.pickupLocation?.address || 'PantryPal Fulfillment Center, Hub 42'}</p>
            </div>

            <div className="p-3 bg-gray-800/60 rounded-xl border border-gray-700">
              <span className="text-[10px] font-bold text-blue-400 uppercase">Customer Drop Location</span>
              <p className="font-bold text-white mt-0.5">{order.address?.fullName || customer.name}</p>
              <p className="text-gray-400 text-[11px] mt-0.5">
                {order.address?.houseFlat}, {order.address?.street}, {order.address?.area}, {order.address?.city}
              </p>
            </div>
          </div>

          <a
            href={`https://maps.google.com/?q=${order.address?.latitude || 28.6139},${order.address?.longitude || 77.2090}`}
            target="_blank"
            rel="noreferrer"
            className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl hover:bg-blue-700 transition flex items-center justify-center space-x-1"
          >
            <Navigation className="w-4 h-4" />
            <span>Open in Google Maps Navigation</span>
          </a>
        </div>

        {/* Customer Contact Card */}
        <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 flex justify-between items-center text-xs">
          <div>
            <span className="text-gray-400 text-[10px] uppercase font-bold">Customer Contact</span>
            <h4 className="font-bold text-white text-sm">{order.address?.fullName || customer.name}</h4>
            <p className="text-gray-400 text-[11px]">{order.address?.phone || customer.phone}</p>
          </div>
          <a
            href={`tel:${order.address?.phone || customer.phone}`}
            className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700"
          >
            <Phone className="w-5 h-5" />
          </a>
        </div>

        {/* Workflow Action Controls */}
        <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 space-y-3">
          <h3 className="font-bold text-gray-300 text-xs">Delivery Actions</h3>

          {delivery.status === 'ASSIGNED' && (
            <div className="flex space-x-2">
              <button
                onClick={handleReject}
                className="flex-1 py-3 bg-red-900/50 border border-red-700 text-red-300 font-bold rounded-xl text-xs hover:bg-red-900"
              >
                Reject Order
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700 shadow-md"
              >
                Accept Order
              </button>
            </div>
          )}

          {delivery.status === 'ACCEPTED' && (
            <button
              onClick={() => handleUpdateStatus('PICKED_UP')}
              className="w-full py-3 bg-amber-600 text-white font-bold rounded-xl text-xs hover:bg-amber-700 flex items-center justify-center space-x-1"
            >
              <PackageCheck className="w-4 h-4" />
              <span>Mark as Picked Up at Store</span>
            </button>
          )}

          {delivery.status === 'PICKED_UP' && (
            <button
              onClick={() => handleUpdateStatus('OUT_FOR_DELIVERY')}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl text-xs hover:bg-blue-700 flex items-center justify-center space-x-1"
            >
              <Truck className="w-4 h-4" />
              <span>Mark as Out for Delivery</span>
            </button>
          )}

          {delivery.status === 'OUT_FOR_DELIVERY' && (
            <button
              onClick={() => handleUpdateStatus('DELIVERED')}
              className="w-full py-3.5 bg-emerald-600 text-white font-extrabold rounded-xl text-xs hover:bg-emerald-700 flex items-center justify-center space-x-1 shadow-lg animate-pulse"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Confirm Handover & Mark DELIVERED</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
