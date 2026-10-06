import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, ShoppingBag } from 'lucide-react';

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart } = useCart();

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="pb-24 max-w-md mx-auto min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-lg font-extrabold text-gray-900">Your Cart is Empty</h2>
        <p className="text-xs text-gray-500 mt-1 max-w-xs">
          Looks like you haven't added any fresh groceries to your cart yet.
        </p>
        <button
          onClick={() => navigate('/categories')}
          className="mt-6 bg-emerald-600 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md hover:bg-emerald-700 transition"
        >
          Explore Groceries
        </button>
      </div>
    );
  }

  return (
    <div className="pb-28 max-w-md mx-auto min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 shadow-xs z-30 flex items-center justify-between">
        <h1 className="font-extrabold text-base text-gray-900">My Shopping Cart ({cart.items.length})</h1>
        <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-lg">
          15 Min Delivery
        </span>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Cart Items List */}
        <div className="space-y-3">
          {cart.items.map((item) => {
            const prod = item.product || {};
            const isOutOfStock = prod.stockQuantity < item.quantity;

            return (
              <div
                key={item._id}
                className={`bg-white rounded-2xl p-3 border shadow-xs flex items-center space-x-3 ${
                  isOutOfStock ? 'border-red-300 bg-red-50/20' : 'border-gray-100'
                }`}
              >
                <img
                  src={prod.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80'}
                  alt={prod.name}
                  className="w-16 h-16 object-cover rounded-xl border border-gray-100 flex-shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-xs truncate">{prod.name || 'Product'}</h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">{prod.weight || prod.unit}</p>

                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs font-extrabold text-gray-900">₹{item.unitPrice}</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">
                      Shelf Life: {prod.shelfLifeDays || 7}d
                    </span>
                  </div>

                  {isOutOfStock && (
                    <p className="text-[10px] text-red-600 font-bold mt-1">
                      ⚠️ Stock limited to {prod.stockQuantity} items
                    </p>
                  )}
                </div>

                {/* Quantity Controls & Delete */}
                <div className="flex flex-col items-end justify-between space-y-2">
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="text-gray-400 hover:text-red-500 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center bg-gray-100 rounded-lg p-0.5 border border-gray-200">
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="p-1 rounded bg-white text-gray-700 shadow-xs"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-2 text-xs font-bold text-gray-900">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="p-1 rounded bg-white text-gray-700 shadow-xs"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bill Summary */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-2">
          <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider text-gray-400">Bill Details</h3>
          <div className="flex justify-between text-xs text-gray-600">
            <span>Items Subtotal</span>
            <span className="font-semibold text-gray-900">₹{cart.subtotal}</span>
          </div>
          <div className="flex justify-between text-xs text-emerald-600">
            <span>Special Savings</span>
            <span className="font-semibold">-₹{cart.discount}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>Delivery Fee</span>
            <span className="font-semibold text-gray-900">
              {cart.deliveryFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `₹${cart.deliveryFee}`}
            </span>
          </div>
          <hr className="my-2 border-gray-100" />
          <div className="flex justify-between text-sm font-extrabold text-gray-900 pt-1">
            <span>Total Payable</span>
            <span className="text-emerald-600">₹{cart.totalAmount}</span>
          </div>
        </div>

        {/* Smart Expiry Guarantee Banner */}
        <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-200 flex items-center space-x-2 text-xs text-emerald-900">
          <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>Purchases are automatically synced with Smart Expiry Tracking after delivery!</span>
        </div>
      </div>

      {/* Fixed Bottom Checkout Button */}
      <div className="fixed bottom-[60px] left-0 right-0 max-w-md mx-auto bg-white p-3 border-t border-gray-200 z-40">
        <button
          onClick={() => navigate('/checkout')}
          className="w-full bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl shadow-md hover:bg-emerald-700 transition flex items-center justify-between text-sm"
        >
          <div>
            <span className="block text-[10px] text-emerald-200 font-normal">Total: ₹{cart.totalAmount}</span>
            <span>Proceed to Checkout</span>
          </div>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
