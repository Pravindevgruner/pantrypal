import React from 'react';
import { Heart, Plus, Minus, Clock, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product, onSelect }) {
  const { cart, addToCart, updateQuantity, wishlist, toggleWishlist } = useCart();

  const isWishlisted = wishlist.some((p) => (p._id || p) === product._id);
  const cartItem = cart.items ? cart.items.find((item) => item.product?._id === product._id || item.product === product._id) : null;

  const currentPrice = product.discountPrice > 0 ? product.discountPrice : product.price;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition group flex flex-col justify-between">
      <div className="relative cursor-pointer" onClick={() => onSelect && onSelect(product._id)}>
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-36 object-cover group-hover:scale-105 transition duration-300"
        />
        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product._id);
          }}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 backdrop-blur-md text-gray-600 hover:text-red-500 shadow-sm transition"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
        </button>

        {/* Shelf Life Badge */}
        <div className="absolute bottom-2 left-2 bg-emerald-950/70 backdrop-blur-md text-emerald-300 text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center">
          <Clock className="w-3 h-3 mr-1" />
          Shelf Life: {product.shelfLifeDays}d
        </div>
      </div>

      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600">
            {product.categoryName || 'Grocery'}
          </span>
          <h3
            className="font-semibold text-gray-800 text-sm line-clamp-1 cursor-pointer hover:text-emerald-600"
            onClick={() => onSelect && onSelect(product._id)}
          >
            {product.name}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">{product.weight || product.unit}</p>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div>
            <div className="flex items-baseline space-x-1">
              <span className="text-base font-bold text-gray-900">₹{currentPrice}</span>
              {product.discountPrice > 0 && (
                <span className="text-xs text-gray-400 line-through">₹{product.price}</span>
              )}
            </div>
          </div>

          {cartItem ? (
            <div className="flex items-center bg-emerald-50 border border-emerald-200 rounded-lg p-1">
              <button
                onClick={() => updateQuantity(cartItem._id, cartItem.quantity - 1)}
                className="p-1 rounded bg-white text-emerald-700 shadow-xs hover:bg-emerald-100"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 text-xs font-bold text-emerald-900">{cartItem.quantity}</span>
              <button
                onClick={() => updateQuantity(cartItem._id, cartItem.quantity + 1)}
                className="p-1 rounded bg-white text-emerald-700 shadow-xs hover:bg-emerald-100"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => addToCart(product._id, 1)}
              className="bg-emerald-600 text-white p-2 rounded-xl hover:bg-emerald-700 transition flex items-center space-x-1 shadow-sm font-medium text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
