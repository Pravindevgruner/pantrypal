import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, ShieldAlert, ArrowRight, PackageCheck, Zap, CreditCard } from 'lucide-react';

export default function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order || {};
  const isPennyTest = location.state?.pennyTest || order.paymentMethod !== 'COD';

  return (
    <div className="pb-24 max-w-md mx-auto min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4 animate-bounce">
        <CheckCircle2 className="w-12 h-12" />
      </div>

      <div className="flex items-center space-x-1.5 mb-2">
        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full">
          Payment & Order Verified
        </span>
        {isPennyTest && (
          <span className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white text-[10px] font-extrabold uppercase px-2 py-1 rounded-full flex items-center">
            <Zap className="w-3 h-3 mr-0.5" />
            ₹1 Penny Test
          </span>
        )}
      </div>

      <h1 className="text-xl font-extrabold text-gray-900">Order Placed Successfully!</h1>
      <p className="text-xs text-gray-500 mt-1 font-mono">Order #{order.orderNumber || 'PP-100852'}</p>

      {/* Bill & Transaction Box */}
      <div className="w-full bg-white rounded-2xl p-4 border border-gray-100 shadow-xs my-5 text-left space-y-2 text-xs">
        <div className="flex justify-between text-gray-600">
          <span>Cart Value:</span>
          <span className="font-bold text-gray-900">₹{order.totalAmount}</span>
        </div>

        {isPennyTest ? (
          <div className="flex justify-between text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded-lg">
            <span>Razorpay Charge (Penny Test):</span>
            <span className="font-black text-sm">₹1.00</span>
          </div>
        ) : (
          <div className="flex justify-between text-gray-600">
            <span>Payment Mode:</span>
            <span className="font-bold text-gray-900">{order.paymentMethod || 'COD'}</span>
          </div>
        )}

        <div className="flex justify-between text-gray-600">
          <span>Payment Status:</span>
          <span className="font-bold text-emerald-600">
            {order.paymentStatus === 'SUCCESSFUL' || order.paymentStatus === 'PAID' ? 'PAID / SUCCESSFUL' : order.paymentStatus || 'PENDING'}
          </span>
        </div>

        {order.razorpayPaymentId && (
          <div className="flex justify-between text-slate-500 font-mono text-[10px] pt-1 border-t">
            <span>Razorpay Payment ID:</span>
            <span className="font-bold text-slate-700">{order.razorpayPaymentId}</span>
          </div>
        )}

        <div className="flex justify-between text-gray-600 pt-1">
          <span>Delivery Partner:</span>
          <span className="font-semibold text-emerald-600">Assigning Rider...</span>
        </div>
      </div>

      {/* Expiry Sync Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 w-full mb-6 text-left flex items-start space-x-3 shadow-xs">
        <ShieldAlert className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-900">
          <h4 className="font-bold text-sm">Smart Expiry System Activated</h4>
          <p className="text-[11px] text-emerald-700 mt-0.5 leading-relaxed">
            All purchased groceries have been automatically registered in your Household Expiry Tracker. You will receive dynamic freshness reminders before products expire!
          </p>
        </div>
      </div>

      <div className="w-full space-y-2.5">
        <button
          onClick={() => navigate(`/orders/${order._id || ''}`)}
          className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-xl shadow-md hover:bg-emerald-700 transition flex items-center justify-center space-x-2 text-xs"
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
