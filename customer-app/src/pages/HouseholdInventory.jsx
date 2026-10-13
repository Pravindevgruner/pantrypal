import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ExpiryBadge from '../components/ExpiryBadge';
import { expiryAPI, productAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  Package,
  Plus,
  Trash2,
  CheckCircle2,
  Search,
  RefreshCw,
  Clock,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  LogIn
} from 'lucide-react';
import dayjs from 'dayjs';

export default function HouseholdInventory() {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Item Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [productsList, setProductsList] = useState([]);
  const [newItem, setNewItem] = useState({
    productName: '',
    quantity: 1,
    unit: 'pcs',
    shelfLifeDays: 7,
    purchaseDate: dayjs().format('YYYY-MM-DD'),
    category: 'Household Grocery',
    notes: '',
  });

  // Action Modal State (Consume / Discard)
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionType, setActionType] = useState('CONSUME'); // 'CONSUME' or 'DISCARD'
  const [actionQty, setActionQty] = useState(1);

  useEffect(() => {
    if (user) {
      loadHouseholdItems();
      loadProductsList();
    } else {
      setLoading(false);
    }
  }, [user, activeTab]);

  const loadHouseholdItems = async () => {
    setLoading(true);
    try {
      const res = await expiryAPI.getExpiryItems({
        status: activeTab !== 'ALL' ? activeTab : undefined,
        search: searchQuery || undefined,
      });
      if (res.data.success) {
        setItems(res.data.data.items);
        setSummary(res.data.data.summary || {});
      }
    } catch (err) {
      console.error('Failed to load household items:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProductsList = async () => {
    try {
      const res = await productAPI.getProducts({ limit: 50 });
      if (res.data.success) {
        setProductsList(res.data.data.products);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickDemoLogin = async () => {
    try {
      await login('customer@example.com', 'password123');
    } catch (err) {
      alert('Login error. Please try manually via Login page.');
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      await expiryAPI.addExpiryItem({
        ...newItem,
        quantity: Number(newItem.quantity) || 1,
        shelfLifeDays: Number(newItem.shelfLifeDays) || 7,
      });
      setShowAddModal(false);
      setNewItem({
        productName: '',
        quantity: 1,
        unit: 'pcs',
        shelfLifeDays: 7,
        purchaseDate: dayjs().format('YYYY-MM-DD'),
        category: 'Household Grocery',
        notes: '',
      });
      loadHouseholdItems();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add item');
    }
  };

  const handleActionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      if (actionType === 'CONSUME') {
        await expiryAPI.consumeItem(selectedItem._id, actionQty);
      } else {
        await expiryAPI.discardItem(selectedItem._id, actionQty);
      }
      setSelectedItem(null);
      loadHouseholdItems();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Remove this item from your household pantry?')) return;
    try {
      await expiryAPI.deleteExpiryItem(id);
      loadHouseholdItems();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove item');
    }
  };

  const handleSelectCatalogProduct = (prod) => {
    setNewItem({
      ...newItem,
      productName: prod.name,
      shelfLifeDays: prod.shelfLifeDays || 7,
      unit: prod.unit || 'pcs',
      category: prod.categoryName || 'Household Grocery',
    });
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.productName.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'FRESH') return matchesSearch && item.status === 'FRESH';
    if (activeTab === 'EXPIRING_SOON') return matchesSearch && item.status === 'EXPIRING_SOON';
    if (activeTab === 'EXPIRED') return matchesSearch && item.status === 'EXPIRED';
    if (activeTab === 'CONSUMED') return matchesSearch && item.status === 'CONSUMED';
    if (activeTab === 'DISCARDED') return matchesSearch && item.status === 'DISCARDED';
    return matchesSearch;
  });

  return (
    <div className="pb-28 max-w-md mx-auto min-h-screen bg-gray-50">
      <Navbar />

      <div className="px-4 py-4 space-y-4">
        {/* Header Title & Add Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-base text-gray-900 leading-tight">
                Household Grocery Pantry
              </h1>
              <p className="text-[11px] text-gray-500">Live inventory of groceries currently at home</p>
            </div>
          </div>

          {user && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-2 rounded-xl flex items-center space-x-1 shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Item</span>
            </button>
          )}
        </div>

        {/* User Not Logged In Banner */}
        {!user && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-start space-x-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-sm text-amber-900">Sign in to track your Pantry</h3>
                <p className="text-xs text-amber-800 mt-0.5">
                  Log in to manage your household food inventory and receive automated expiry alerts.
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleQuickDemoLogin}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center space-x-1 shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>1-Click Demo Login</span>
              </button>
              <button
                onClick={() => navigate('/login')}
                className="py-2 px-3 bg-white border border-amber-300 text-amber-900 font-bold rounded-xl text-xs"
              >
                Sign In
              </button>
            </div>
          </div>
        )}

        {/* Metric Overview Cards */}
        {user && (
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div
              onClick={() => setActiveTab('ALL')}
              className={`p-2.5 rounded-xl border cursor-pointer transition ${
                activeTab === 'ALL' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 border-gray-100'
              }`}
            >
              <span className="font-extrabold text-base block">{summary.totalCount || items.length}</span>
              <span className="text-[10px]">All Items</span>
            </div>

            <div
              onClick={() => setActiveTab('FRESH')}
              className={`p-2.5 rounded-xl border cursor-pointer transition ${
                activeTab === 'FRESH' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700 border-gray-100'
              }`}
            >
              <span className="font-extrabold text-base block text-emerald-600 group-hover:text-white">
                {summary.freshCount || 0}
              </span>
              <span className="text-[10px]">Fresh</span>
            </div>

            <div
              onClick={() => setActiveTab('EXPIRING_SOON')}
              className={`p-2.5 rounded-xl border cursor-pointer transition ${
                activeTab === 'EXPIRING_SOON' ? 'bg-amber-500 text-white' : 'bg-white text-gray-700 border-gray-100'
              }`}
            >
              <span className="font-extrabold text-base block text-amber-600">
                {summary.expiringSoonCount || 0}
              </span>
              <span className="text-[10px]">Expiring</span>
            </div>

            <div
              onClick={() => setActiveTab('EXPIRED')}
              className={`p-2.5 rounded-xl border cursor-pointer transition ${
                activeTab === 'EXPIRED' ? 'bg-red-600 text-white' : 'bg-white text-gray-700 border-gray-100'
              }`}
            >
              <span className="font-extrabold text-base block text-red-600">
                {summary.expiredCount || 0}
              </span>
              <span className="text-[10px]">Expired</span>
            </div>
          </div>
        )}

        {/* Search Input Bar */}
        {user && (
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search groceries in pantry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 pl-9 pr-3 py-2 rounded-xl text-xs text-gray-800 focus:outline-emerald-500 shadow-xs"
            />
          </div>
        )}

        {/* Filter Chips */}
        {user && (
          <div className="flex space-x-2 overflow-x-auto no-scrollbar py-1 text-xs">
            {['ALL', 'FRESH', 'EXPIRING_SOON', 'EXPIRED', 'CONSUMED', 'DISCARDED'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition ${
                  activeTab === tab
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                {tab.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        )}

        {/* Pantry Items List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white h-24 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : !user ? null : filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200 p-6 space-y-3">
            <Package className="w-12 h-12 text-gray-300 mx-auto" />
            <div>
              <h3 className="font-bold text-gray-800 text-sm">No items found in {activeTab}</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                Purchased groceries appear here automatically, or tap "Add Item" to add groceries you already own!
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl"
            >
              Add Your First Item
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-xs flex flex-col justify-between space-y-3 hover:shadow-sm transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3 min-w-0">
                    <img
                      src={item.productImage || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80'}
                      alt={item.productName}
                      className="w-14 h-14 object-cover rounded-xl border border-gray-100 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-900 text-xs truncate">{item.productName}</h3>
                      <div className="mt-1">
                        <ExpiryBadge status={item.status} daysRemaining={item.daysRemaining} />
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1">
                        Owned: <span className="font-bold text-gray-800">{item.remainingQuantity !== undefined ? item.remainingQuantity : item.quantity} {item.unit}</span> (Total: {item.quantity})
                      </p>
                      <p className="text-[10px] text-gray-400">
                        Expires: {dayjs(item.expiryDate).format('MMM D, YYYY')} ({item.shelfLifeDays}d shelf life)
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteItem(item._id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition"
                    title="Remove from pantry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Bottom Action Buttons (Consume / Discard) */}
                {['FRESH', 'EXPIRING_SOON', 'EXPIRED'].includes(item.status) && (
                  <div className="flex items-center space-x-2 pt-2 border-t border-gray-50 text-xs">
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setActionType('CONSUME');
                        setActionQty(1);
                      }}
                      className="flex-1 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 rounded-xl font-bold text-[11px] flex items-center justify-center space-x-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Mark Consumed</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setActionType('DISCARD');
                        setActionQty(1);
                      }}
                      className="flex-1 py-1.5 bg-red-50 text-red-800 hover:bg-red-100 border border-red-200 rounded-xl font-bold text-[11px] flex items-center justify-center space-x-1"
                    >
                      <XCircle className="w-3.5 h-3.5 text-red-600" />
                      <span>Mark Discarded</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm space-y-4 my-8">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-gray-900 text-sm">Add Item to Household Pantry</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-sm font-bold">
                ✕
              </button>
            </div>

            {/* Quick Pick from Grocery Catalog */}
            {productsList.length > 0 && (
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Quick Pick from Catalog
                </label>
                <div className="flex space-x-1.5 overflow-x-auto no-scrollbar py-1">
                  {productsList.slice(0, 6).map((prod) => (
                    <button
                      key={prod._id}
                      type="button"
                      onClick={() => handleSelectCatalogProduct(prod)}
                      className="flex-shrink-0 text-[10px] bg-gray-100 hover:bg-emerald-50 hover:text-emerald-800 border px-2 py-1 rounded-lg font-semibold"
                    >
                      {prod.name.split(' ')[0]} ({prod.shelfLifeDays}d)
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleAddItem} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fresh Milk, Tomatoes, Bread"
                  value={newItem.productName}
                  onChange={(e) => setNewItem({ ...newItem, productName: e.target.value })}
                  className="w-full bg-gray-50 border p-2.5 rounded-xl focus:outline-emerald-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                    className="w-full bg-gray-50 border p-2.5 rounded-xl focus:outline-emerald-500 font-bold text-center"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Unit</label>
                  <select
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    className="w-full bg-gray-50 border p-2.5 rounded-xl focus:outline-emerald-500"
                  >
                    <option value="pcs">pcs</option>
                    <option value="pack">pack</option>
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="L">L</option>
                    <option value="bottle">bottle</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Shelf Life (Days)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newItem.shelfLifeDays}
                    onChange={(e) => setNewItem({ ...newItem, shelfLifeDays: e.target.value })}
                    className="w-full bg-amber-50 border border-amber-300 p-2.5 rounded-xl focus:outline-amber-500 font-extrabold text-amber-900 text-center"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Purchase Date</label>
                  <input
                    type="date"
                    required
                    value={newItem.purchaseDate}
                    onChange={(e) => setNewItem({ ...newItem, purchaseDate: e.target.value })}
                    className="w-full bg-gray-50 border p-2.5 rounded-xl focus:outline-emerald-500 text-[11px]"
                  />
                </div>
              </div>

              {/* Expiry preview */}
              <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-100 text-[11px] text-emerald-900 flex items-center justify-between">
                <span>Calculated Expiry:</span>
                <span className="font-extrabold">
                  {dayjs(newItem.purchaseDate).add(Number(newItem.shelfLifeDays) || 7, 'day').format('MMM D, YYYY')}
                </span>
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
                  className="flex-1 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-sm"
                >
                  Save to Pantry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Consume / Discard Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-xs space-y-4">
            <h3 className="font-bold text-gray-900 text-sm">
              {actionType === 'CONSUME' ? 'Mark as Consumed' : 'Mark as Discarded'}
            </h3>
            <p className="text-xs text-gray-500">
              Product: <span className="font-bold text-gray-800">{selectedItem.productName}</span>
            </p>

            <form onSubmit={handleActionSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  max={selectedItem.remainingQuantity !== undefined ? selectedItem.remainingQuantity : selectedItem.quantity}
                  value={actionQty}
                  onChange={(e) => setActionQty(Number(e.target.value))}
                  className="w-full bg-gray-50 border p-2 rounded-xl focus:outline-emerald-500 font-bold text-center"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="flex-1 py-2 border rounded-xl font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-2 text-white font-bold rounded-xl ${
                    actionType === 'CONSUME' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
