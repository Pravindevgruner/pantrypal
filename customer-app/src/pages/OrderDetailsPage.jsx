import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { orderAPI } from '../services/api';
import { ArrowLeft, MapPin, Truck, CheckCircle2, XCircle, Clock, ShieldCheck, Phone, FileText } from 'lucide-react';

export default function OrderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrderDetails();
  }, [id]);

  const loadOrderDetails = async () => {
    setLoading(true);
    try {
      const res = await orderAPI.getOrderById(id);
      if (res.data.success) {
        setOrder(res.data.data.order);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      const res = await orderAPI.cancelOrder(id);
      if (res.data.success) {
        setOrder(res.data.data.order);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error cancelling order');
    }
  };

  const statuses = ['PLACED', 'CONFIRMED', 'ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED'];

  const getStatusStepIndex = (status) => {
    if (status === 'CANCELLED') return -1;
    return statuses.indexOf(status);
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-gray-50 p-4 animate-pulse">
        <div className="h-40 bg-gray-200 rounded-2xl mb-4"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-gray-50 p-6 text-center">
        <p className="text-sm font-semibold text-gray-700">Order not found</p>
      </div>
    );
  }

  const currentStep = getStatusStepIndex(order.orderStatus);

  return (
    <div className="pb-24 max-w-md mx-auto min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 shadow-xs z-30 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button onClick={() => navigate('/orders')} className="p-1 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-extrabold text-sm text-gray-900">Order #{order.orderNumber}</h1>
            <p className="text-[10px] text-gray-500">
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
          ₹{order.totalAmount}
        </span>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Order Status Stepper */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-4">
          <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider text-gray-500 flex items-center">
            <Truck className="w-4 h-4 text-emerald-600 mr-1" />
            Live Delivery Tracking
          </h3>

          {order.orderStatus === 'CANCELLED' ? (
            <div className="p-3 bg-red-50 text-red-800 rounded-xl text-xs font-semibold flex items-center">
              <XCircle className="w-4 h-4 mr-2 text-red-600" />
              Order has been cancelled.
            </div>
          ) : (
            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
              {statuses.map((st, idx) => {
                const isCompleted = currentStep >= idx;
                const isCurrent = currentStep === idx;

                return (
                  <div key={st} className="relative flex items-center text-xs">
                    <div
                      className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center border-2 bg-white transition ${
                        isCompleted
                          ? 'border-emerald-600 text-emerald-600'
                          : 'border-gray-300 text-gray-300'
                      } ${isCurrent ? 'ring-4 ring-emerald-100 bg-emerald-600 text-white' : ''}`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>}
                    </div>

                    <div className="ml-2">
                      <span className={`font-bold ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                        {st.replace(/_/g, ' ')}
                      </span>
                      {isCurrent && (
                        <p className="text-[10px] text-emerald-600 font-semibold mt-0.5 animate-pulse">
                          In Progress...
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Delivery Partner Details if assigned */}
          {order.deliveryPartner && (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between text-xs mt-2">
              <div className="flex items-center space-x-2">
                <img
                  src={order.deliveryPartner.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                  alt="Partner"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <span className="font-bold text-gray-900">{order.deliveryPartner.name}</span>
                  <p className="text-[10px] text-gray-500">Assigned Delivery Agent</p>
                </div>
              </div>
              <a
                href={`tel:${order.deliveryPartner.phone}`}
                className="p-2 bg-emerald-600 text-white rounded-lg flex items-center hover:bg-emerald-700"
              >
                <Phone className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Map Preview Simulation */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-gray-900 flex items-center">
              <MapPin className="w-4 h-4 text-emerald-600 mr-1" />
              Delivery Location
            </span>
            <span className="text-gray-500">{order.address?.city}</span>
          </div>

          <div className="bg-emerald-950/90 text-white rounded-xl p-3 text-xs space-y-1">
            <p className="font-bold">{order.address?.fullName} ({order.address?.phone})</p>
            <p className="text-[11px] text-gray-300">
              {order.address?.houseFlat}, {order.address?.street}, {order.address?.area}, {order.address?.pincode}
            </p>
          </div>
        </div>

        {/* Invoice Item List */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-3">
          <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider text-gray-500 flex items-center">
            <FileText className="w-4 h-4 text-emerald-600 mr-1" />
            Invoice Items ({order.items?.length})
          </h3>

          <div className="divide-y divide-gray-100">
            {order.items?.map((item) => (
              <div key={item._id} className="py-2 flex justify-between items-center text-xs">
                <div className="flex items-center space-x-2">
                  <img
                    src={item.productImage || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80'}
                    alt={item.productName}
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                  <div>
                    <span className="font-bold text-gray-800">{item.productName}</span>
                    <p className="text-[10px] text-gray-400">Qty: {item.quantity} x ₹{item.unitPrice}</p>
                  </div>
                </div>
                <span className="font-extrabold text-gray-900">₹{item.quantity * item.unitPrice}</span>
              </div>
            ))}
          </div>

          <hr className="my-2 border-gray-100" />
          <div className="flex justify-between text-xs font-extrabold text-gray-900">
            <span>Total Paid</span>
            <span className="text-emerald-600">₹{order.totalAmount}</span>
          </div>
        </div>

        {/* Cancel Button if early stage */}
        {['PLACED', 'CONFIRMED'].includes(order.orderStatus) && (
          <button
            onClick={handleCancelOrder}
            className="w-full py-3 bg-red-50 border border-red-200 text-red-700 font-bold rounded-xl text-xs hover:bg-red-100"
          >
            Cancel Order
          </button>
        )}
      </div>
    </div>
  );
}
