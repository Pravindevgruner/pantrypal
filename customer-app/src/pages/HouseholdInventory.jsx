import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ExpiryBadge from '../components/ExpiryBadge';
import { expiryAPI } from '../services/api';
import { Home, Package, ShieldCheck } from 'lucide-react';

export default function HouseholdInventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHouseholdItems();
  }, []);

  const loadHouseholdItems = async () => {
    setLoading(true);
    try {
      const res = await expiryAPI.getExpiryItems();
      if (res.data.success) {
        setItems(res.data.data.items);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-24 max-w-md mx-auto min-h-screen bg-gray-50">
      <Navbar />

      <div className="px-4 py-4 space-y-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-base text-gray-900">Household Grocery Inventory</h1>
            <p className="text-xs text-gray-500">Live tracker of all groceries currently in your pantry</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white h-24 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200 p-4">
            <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <h3 className="font-bold text-gray-800 text-sm">Pantry is Empty</h3>
            <p className="text-xs text-gray-500 mt-1">Groceries purchased through PantryPal appear here automatically!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item._id} className="bg-white rounded-2xl p-3 border border-gray-100 shadow-xs flex items-center space-x-3">
                <img
                  src={item.productImage || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80'}
                  alt={item.productName}
                  className="w-12 h-12 object-cover rounded-xl border border-gray-100"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-xs truncate">{item.productName}</h3>
                  <div className="mt-1">
                    <ExpiryBadge status={item.status} daysRemaining={item.daysRemaining} />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Owned: {item.quantity} {item.unit} | Expiry: {new Date(item.expiryDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
