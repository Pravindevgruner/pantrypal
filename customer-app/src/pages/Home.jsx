import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import ExpiryBadge from '../components/ExpiryBadge';
import { productAPI, categoryAPI, expiryAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowRight, Sparkles, Truck, Award } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expiringSoonItems, setExpiringSoonItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, [user]);

  const fetchHomeData = async () => {
    setLoading(true);
    try {
      const [catRes, prodRes] = await Promise.all([
        categoryAPI.getCategories(),
        productAPI.getProducts({ limit: 12 }),
      ]);

      if (catRes.data.success) setCategories(catRes.data.data.categories);
      if (prodRes.data.success) setProducts(prodRes.data.data.products);

      if (user) {
        const expRes = await expiryAPI.getExpiringSoon();
        if (expRes.data.success) {
          setExpiringSoonItems(expRes.data.data.items);
        }
      }
    } catch (err) {
      console.error('Home data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.categoryName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pb-24 max-w-md mx-auto min-h-screen bg-gray-50">
      <Navbar searchValue={searchQuery} onSearchChange={setSearchQuery} />

      {/* Main Content */}
      <div className="px-4 py-3 space-y-4">
        {/* User Greeting */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-4 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-emerald-200 text-xs font-semibold tracking-wider uppercase">Welcome Back</span>
            <h2 className="text-xl font-extrabold mt-0.5">
              {user ? user.name : 'Guest Shopper'} 👋
            </h2>
            <p className="text-xs text-emerald-100 mt-1">
              Superfast 15-min delivery with automated grocery expiry tracking!
            </p>
          </div>
          <Sparkles className="w-24 h-24 absolute -right-4 -bottom-4 text-white/10" />
        </div>

        {/* Smart Expiry Alert Widget */}
        {user && (
          <div
            onClick={() => navigate('/expiry')}
            className={`rounded-2xl p-4 border shadow-xs cursor-pointer transition flex items-center justify-between ${
              expiringSoonItems.length > 0
                ? 'bg-amber-50 border-amber-200 hover:bg-amber-100/70'
                : 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100/70'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div
                className={`p-2.5 rounded-xl text-white ${
                  expiringSoonItems.length > 0 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-600'
                }`}
              >
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-gray-900 text-sm">Smart Expiry Tracker</h4>
                  {expiringSoonItems.length > 0 && (
                    <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {expiringSoonItems.length} Urgent
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-0.5">
                  {expiringSoonItems.length > 0
                    ? `${expiringSoonItems.length} item(s) in your pantry expiring soon!`
                    : 'All household groceries are fresh and tracked.'}
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
          </div>
        )}

        {/* Categories Section */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-gray-900 text-sm">Categories</h3>
            <button onClick={() => navigate('/categories')} className="text-xs font-bold text-emerald-600 hover:underline">
              See All
            </button>
          </div>

          <div className="flex space-x-3 overflow-x-auto no-scrollbar py-1">
            {categories.map((cat) => (
              <div
                key={cat._id}
                onClick={() => navigate(`/categories?selected=${cat._id}`)}
                className="flex-shrink-0 w-20 text-center cursor-pointer group"
              >
                <div className="w-16 h-16 mx-auto rounded-2xl overflow-hidden bg-gray-100 border border-gray-200/60 p-1 group-hover:border-emerald-500 transition shadow-xs">
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover rounded-xl" />
                </div>
                <span className="text-[11px] font-medium text-gray-700 mt-1 block truncate">
                  {cat.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Features Banners */}
        <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-gray-700">
          <div className="bg-white p-3 rounded-xl border border-gray-100 flex items-center space-x-2 shadow-xs">
            <Truck className="w-4 h-4 text-emerald-600" />
            <span>15 Min Express Delivery</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-gray-100 flex items-center space-x-2 shadow-xs">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>Farm Fresh Quality</span>
          </div>
        </div>

        {/* Product Grid */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-gray-900 text-base">Popular Groceries</h3>
            <span className="text-xs text-gray-500 font-medium">{filteredProducts.length} items</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white h-48 rounded-2xl animate-pulse p-3">
                  <div className="bg-gray-200 h-28 rounded-xl mb-2"></div>
                  <div className="bg-gray-200 h-4 rounded w-3/4 mb-1"></div>
                  <div className="bg-gray-200 h-4 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-200">
              <p className="text-xs text-gray-500">No products found matching "{searchQuery}"</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} onSelect={(id) => navigate(`/categories`)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
