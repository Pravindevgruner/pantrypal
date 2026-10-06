import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, ShieldAlert, ArrowRight, PackageCheck } from 'lucide-react';

export default function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order || {};

  return (
    <div className="pb-24 max-w-md mx-auto min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4 animate-bounce">
        <CheckCircle2 className="w-12 h-12" />
      </div>

      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full mb-2">
        Payment & Order Verified
      </span>

      <h1 className="text-xl font-extrabold text-gray-900">Order Placed Successfully!</h1>
      <p className="text-xs text-gray-500 mt-1">Order #{order.orderNumber || 'PP-100852'}</p>

      <div className="w-full bg-white rounded-2xl p-4 border border-gray-100 shadow-xs my-6 text-left space-y-2 text-xs">
        <div className="flex justify-between text-gray-600">
          <span>Amount Paid:</span>
          <span className="font-bold text-gray-900">₹{order.totalAmount}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Delivery Partner:</span>
          <span className="font-semibold text-emerald-600">Assigning Partner...</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Estimated Delivery:</span>
          <span className="font-semibold text-gray-900">15-20 Mins</span>
        </div>
      </div>

      {/* Expiry Sync Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 w-full mb-6 text-left flex items-start space-x-3">
        <ShieldAlert className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-900">
          <h4 className="font-bold text-sm">Smart Expiry System Activated</h4>
          <p className="text-[11px] text-emerald-700 mt-0.5">
            Your purchased items are linked to our automated shelf-life monitor. You will receive automated alerts before products expire!
          </p>
        </div>
      </div>

      <div className="w-full space-y-2">
        <button
          onClick={() => navigate(`/orders/${order._id || ''}`)}
          className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-md hover:bg-emerald-700 transition flex items-center justify-center space-x-2 text-xs"
        >
          <PackageCheck className="w-4 h-4" />
          <span>Track Delivery Status</span>
        </button>

        <button
          onClick={() => navigate('/expiry')}
          className="w-full bg-amber-50 text-amber-900 border border-amber-200 font-bold py-3 rounded-xl hover:bg-amber-100 transition flex items-center justify-center space-x-2 text-xs"
        >
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          <span>Go to Smart Expiry Dashboard</span>
        </button>
      </div>
    </div>
  );
}
