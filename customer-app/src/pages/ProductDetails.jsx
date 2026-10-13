import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productAPI, expiryAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Heart,
  Plus,
  Minus,
  ShoppingBag,
  Clock,
  ShieldCheck,
  Calendar,
  Sparkles,
  Truck,
  CheckCircle2,
  AlertCircle,
  Home
} from 'lucide-react';
import dayjs from 'dayjs';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, addToCart, updateQuantity, wishlist, toggleWishlist } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [pantryAdded, setPantryAdded] = useState(false);
  const [addingToPantry, setAddingToPantry] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const res = await productAPI.getProductById(id);
      if (res.data.success) {
        setProduct(res.data.data.product);
      }
    } catch (err) {
      console.error('Failed to load product details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-gray-50 p-4 space-y-4 animate-pulse">
        <div className="h-10 bg-gray-200 rounded-xl w-1/3"></div>
        <div className="h-72 bg-gray-200 rounded-2xl"></div>
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-20 bg-gray-200 rounded-2xl"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-gray-50 p-6 text-center flex flex-col justify-center items-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
        <h2 className="text-lg font-bold text-gray-900">Product Not Found</h2>
        <p className="text-xs text-gray-500 mt-1">The requested product could not be found or has been removed.</p>
        <button
          onClick={() => navigate('/categories')}
          className="mt-4 bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl"
        >
          Browse All Products
        </button>
      </div>
    );
  }

  const isWishlisted = wishlist.some((p) => (p._id || p) === product._id);
  const cartItem = cart.items ? cart.items.find((item) => item.product?._id === product._id || item.product === product._id) : null;
  const currentPrice = product.discountPrice > 0 ? product.discountPrice : product.price;
  const discountPercent = product.discountPrice > 0
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  // Smart Expiry Calculation Preview
  const estimatedExpiry = dayjs().add(product.shelfLifeDays || 7, 'day').format('dddd, MMM D, YYYY');

  const handleAddDirectToPantry = async () => {
    if (!user) {
      alert('Please log in as customer to add items to your household pantry.');
      navigate('/login');
      return;
    }

    setAddingToPantry(true);
    try {
      await expiryAPI.addExpiryItem({
        productName: product.name,
        productImage: product.image,
        category: product.categoryName || 'Household Grocery',
        quantity: quantity,
        unit: product.unit || 'pcs',
        shelfLifeDays: product.shelfLifeDays || 7,
        purchaseDate: new Date(),
        productId: product._id,
        notes: `Added from product catalog on ${dayjs().format('MMM D')}`
      });
      setPantryAdded(true);
      setTimeout(() => setPantryAdded(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add to household pantry');
    } finally {
      setAddingToPantry(false);
    }
  };

  return (
    <div className="pb-28 max-w-md mx-auto min-h-screen bg-gray-50">
      {/* Top Header Bar */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-3 z-40 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="font-bold text-xs text-gray-600 uppercase tracking-wider">
          Product Details
        </span>
        <button
          onClick={() => toggleWishlist(product._id)}
          className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
        >
          <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
        </button>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Product Image Card */}
        <div className="relative bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-64 object-cover"
          />

          {/* Category Chip */}
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-extrabold text-emerald-800 shadow-xs">
            {product.categoryName || 'Grocery'}
          </div>

          {/* Stock Status */}
          <div className="absolute top-3 right-3">
            {product.stockQuantity > 0 ? (
              <span className="bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                In Stock ({product.stockQuantity} {product.unit})
              </span>
            ) : (
              <span className="bg-red-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                Out of Stock
              </span>
            )}
          </div>

          {/* Shelf Life Pill Overlay */}
          <div className="absolute bottom-3 left-3 bg-emerald-950/80 backdrop-blur-md text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full flex items-center space-x-1.5 shadow-md">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Guaranteed Shelf Life: {product.shelfLifeDays} Days</span>
          </div>
        </div>

        {/* Product Basic Info */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                {product.brand || 'PantryPal Fresh'}
              </span>
              <h1 className="text-xl font-extrabold text-gray-900 mt-0.5 leading-snug">
                {product.name}
              </h1>
              <p className="text-xs text-gray-500 mt-0.5 font-medium">
                {product.weight || product.unit} • SKU: {product.SKU}
              </p>
            </div>
          </div>

          {/* Pricing Row */}
          <div className="flex items-baseline space-x-2 pt-2">
            <span className="text-2xl font-black text-gray-900">₹{currentPrice}</span>
            {product.discountPrice > 0 && (
              <>
                <span className="text-sm text-gray-400 line-through">₹{product.price}</span>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-2 py-0.5 rounded-full">
                  {discountPercent}% OFF
                </span>
              </>
            )}
          </div>
        </div>

        {/* SMART EXPIRY FORECAST FEATURE CARD */}
        <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-2xl p-4 shadow-md space-y-3 relative overflow-hidden">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-emerald-500/20 text-emerald-300 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-emerald-100">Smart Expiry System Protection</h3>
              <p className="text-[10px] text-emerald-300">Automated tracking on purchase</p>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs space-y-1.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-emerald-200">Shelf Life:</span>
              <span className="font-bold text-white">{product.shelfLifeDays} Days</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-emerald-200">Estimated Expiry Date:</span>
              <span className="font-extrabold text-amber-300">{estimatedExpiry}</span>
            </div>
            <div className="flex justify-between items-center text-[10px] text-emerald-300 pt-1 border-t border-white/10">
              <span>Automatic Reminders:</span>
              <span>7d • 3d • 1d • Expiry Day</span>
            </div>
          </div>

          {/* Quick Add to Household Pantry directly */}
          <button
            onClick={handleAddDirectToPantry}
            disabled={addingToPantry}
            className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition ${
              pantryAdded
                ? 'bg-emerald-500 text-white'
                : 'bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 border border-emerald-600/50'
            }`}
          >
            {pantryAdded ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Added to Household Pantry!</span>
              </>
            ) : (
              <>
                <Home className="w-4 h-4 text-emerald-300" />
                <span>Already have this? Add to My Household Pantry</span>
              </>
            )}
          </button>
        </div>

        {/* Product Description */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-2">
          <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500">
            Product Description
          </h3>
          <p className="text-xs text-gray-700 leading-relaxed">
            {product.description || 'Freshly picked, sustainably packaged, and delivered straight to your door with real-time temperature-controlled handling.'}
          </p>

          <div className="pt-2 border-t border-gray-100 space-y-1 text-xs text-gray-600">
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>Delivered in 15-20 minutes by PantryPal Express</span>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>100% Quality Guaranteed or Instant Replacement</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom CTA Bar */}
      <div className="fixed bottom-[60px] left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md p-3 border-t border-gray-200 z-40 flex items-center space-x-3 shadow-lg">
        {/* Quantity Controls */}
        <div className="flex items-center bg-gray-100 rounded-xl p-1 border border-gray-200">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="p-1.5 rounded-lg bg-white text-gray-700 shadow-xs hover:bg-gray-50"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="px-3 text-xs font-bold text-gray-900">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="p-1.5 rounded-lg bg-white text-gray-700 shadow-xs hover:bg-gray-50"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Add To Cart Button */}
        <button
          onClick={() => {
            addToCart(product._id, quantity);
            navigate('/cart');
          }}
          disabled={product.stockQuantity <= 0}
          className="flex-1 bg-emerald-600 text-white font-extrabold py-3 px-4 rounded-xl shadow-md hover:bg-emerald-700 transition flex items-center justify-between text-xs disabled:opacity-50"
        >
          <span>Add to Cart ({quantity}x)</span>
          <span className="font-bold text-emerald-200">₹{currentPrice * quantity}</span>
        </button>
      </div>
    </div>
  );
}
