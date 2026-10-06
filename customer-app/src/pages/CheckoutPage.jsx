import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { addressAPI, orderAPI, paymentAPI } from '../services/api';
import { MapPin, CreditCard, CheckCircle2, ChevronRight, ShieldCheck, Plus, ArrowLeft } from 'lucide-react';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, fetchCart } = useCart();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Address form
  const [newAddr, setNewAddr] = useState({
    fullName: '',
    phone: '',
    houseFlat: '',
    street: '',
    area: '',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110001',
    type: 'Home',
  });

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const res = await addressAPI.getAddresses();
      if (res.data.success) {
        setAddresses(res.data.data.addresses);
        const defaultAddr = res.data.data.addresses.find((a) => a.isDefault) || res.data.data.addresses[0];
        if (defaultAddr) setSelectedAddressId(defaultAddr._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await addressAPI.createAddress(newAddr);
      if (res.data.success) {
        setShowAddModal(false);
        loadAddresses();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding address');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      alert('Please select or add a delivery address');
      return;
    }

    setLoading(true);
    try {
      // 1. Create Backend Order
      const orderRes = await orderAPI.createOrder({
        addressId: selectedAddressId,
        paymentMethod,
      });

      if (!orderRes.data.success) {
        alert(orderRes.data.message || 'Failed to place order');
        setLoading(false);
        return;
      }

      const order = orderRes.data.data.order;

      // 2. If Payment method is online (UPI / CARD / NETBANKING), process Razorpay Integration
      if (paymentMethod !== 'COD') {
        try {
          const payOrderRes = await paymentAPI.createPaymentOrder({
            amount: order.totalAmount,
            orderId: order._id,
          });

          if (payOrderRes.data.success) {
            const { razorpayOrderId } = payOrderRes.data.data;
            // Verify payment
            await paymentAPI.verifyPayment({
              razorpay_order_id: razorpayOrderId,
              razorpay_payment_id: `pay_sim_${Date.now()}`,
              razorpay_signature: 'simulated_signature_dev',
              orderId: order._id,
            });
          }
        } catch (payErr) {
          console.log('[Payment Note] Payment handled via simulation fallback:', payErr.message);
        }
      }

      await fetchCart();
      navigate('/order-success', { state: { order } });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Order placement failed');
    } finally {
      setLoading(false);
    }
  };

  const selectedAddress = addresses.find((a) => a._id === selectedAddressId);

  return (
    <div className="pb-28 max-w-md mx-auto min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 shadow-xs z-30 flex items-center space-x-3">
        <button onClick={() => navigate(-1)} className="p-1 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-extrabold text-base text-gray-900">Checkout</h1>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Delivery Address Section */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider text-gray-500 flex items-center">
              <MapPin className="w-4 h-4 text-emerald-600 mr-1" />
              Delivery Address
            </h3>
            <button
              onClick={() => setShowAddModal(true)}
              className="text-xs font-bold text-emerald-600 flex items-center hover:underline"
            >
              <Plus className="w-3.5 h-3.5 mr-0.5" />
              Add New
            </button>
          </div>

          {addresses.length === 0 ? (
            <p className="text-xs text-amber-600">No address saved. Please add a delivery address.</p>
          ) : (
            <div className="space-y-2">
              {addresses.map((addr) => (
                <div
                  key={addr._id}
                  onClick={() => setSelectedAddressId(addr._id)}
                  className={`p-3 rounded-xl border cursor-pointer transition flex items-start space-x-3 ${
                    selectedAddressId === addr._id
                      ? 'border-emerald-500 bg-emerald-50/40 text-emerald-950'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    checked={selectedAddressId === addr._id}
                    onChange={() => setSelectedAddressId(addr._id)}
                    className="mt-1 accent-emerald-600"
                  />
                  <div className="text-xs flex-1">
                    <div className="font-bold text-gray-900 flex items-center space-x-2">
                      <span>{addr.fullName}</span>
                      <span className="bg-gray-100 text-gray-600 px-1.5 py-0.2 rounded text-[10px] uppercase">
                        {addr.type}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-0.5">
                      {addr.houseFlat}, {addr.street}, {addr.area}, {addr.city} - {addr.pincode}
                    </p>
                    <p className="text-gray-500 text-[11px]">Phone: {addr.phone}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Method Section */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-3">
          <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider text-gray-500 flex items-center">
            <CreditCard className="w-4 h-4 text-emerald-600 mr-1" />
            Select Payment Method
          </h3>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { id: 'UPI', label: 'UPI / Google Pay', badge: 'Recommended' },
              { id: 'CARD', label: 'Debit / Credit Card' },
              { id: 'NETBANKING', label: 'Net Banking' },
              { id: 'COD', label: 'Cash on Delivery' },
            ].map((method) => (
              <div
                key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                  paymentMethod === method.id
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                    : 'border-gray-100 text-gray-700 hover:border-gray-200'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold">{method.label}</span>
                  {paymentMethod === method.id && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </div>
                {method.badge && (
                  <span className="mt-1 text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded w-fit">
                    {method.badge}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary Box */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-2 text-xs">
          <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider text-gray-400">Order Summary</h3>
          <div className="flex justify-between text-gray-600">
            <span>Items ({cart.items?.length})</span>
            <span>₹{cart.subtotal}</span>
          </div>
          <div className="flex justify-between text-emerald-600">
            <span>Discount</span>
            <span>-₹{cart.discount}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Delivery Fee</span>
            <span>{cart.deliveryFee === 0 ? 'FREE' : `₹${cart.deliveryFee}`}</span>
          </div>
          <hr className="my-1 border-gray-100" />
          <div className="flex justify-between text-sm font-extrabold text-gray-900 pt-1">
            <span>Total Amount</span>
            <span className="text-emerald-600">₹{cart.totalAmount}</span>
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm space-y-4">
            <h3 className="font-bold text-gray-900 text-sm">Add Delivery Address</h3>
            <form onSubmit={handleAddAddress} className="space-y-3 text-xs">
              <input
                type="text"
                placeholder="Full Name"
                required
                value={newAddr.fullName}
                onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                className="w-full bg-gray-50 border p-2.5 rounded-xl focus:outline-emerald-500"
              />
              <input
                type="text"
                placeholder="Phone Number"
                required
                value={newAddr.phone}
                onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                className="w-full bg-gray-50 border p-2.5 rounded-xl focus:outline-emerald-500"
              />
              <input
                type="text"
                placeholder="House / Flat No."
                required
                value={newAddr.houseFlat}
                onChange={(e) => setNewAddr({ ...newAddr, houseFlat: e.target.value })}
                className="w-full bg-gray-50 border p-2.5 rounded-xl focus:outline-emerald-500"
              />
              <input
                type="text"
                placeholder="Street / Landmark"
                value={newAddr.street}
                onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                className="w-full bg-gray-50 border p-2.5 rounded-xl focus:outline-emerald-500"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Area / Sector"
                  required
                  value={newAddr.area}
                  onChange={(e) => setNewAddr({ ...newAddr, area: e.target.value })}
                  className="w-full bg-gray-50 border p-2.5 rounded-xl focus:outline-emerald-500"
                />
                <input
                  type="text"
                  placeholder="Pincode"
                  required
                  value={newAddr.pincode}
                  onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                  className="w-full bg-gray-50 border p-2.5 rounded-xl focus:outline-emerald-500"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border rounded-xl font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fixed Bottom Order Button */}
      <div className="fixed bottom-[60px] left-0 right-0 max-w-md mx-auto bg-white p-3 border-t border-gray-200 z-40">
        <button
          onClick={handlePlaceOrder}
          disabled={loading || !selectedAddressId}
          className="w-full bg-emerald-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-md hover:bg-emerald-700 transition flex items-center justify-center space-x-2 disabled:opacity-50 text-sm"
        >
          {loading ? (
            <span>Processing Order & Payment...</span>
          ) : (
            <>
              <span>Pay & Confirm Order (₹{cart.totalAmount})</span>
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
