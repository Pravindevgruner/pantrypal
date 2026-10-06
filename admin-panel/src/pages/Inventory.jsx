import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { inventoryAPI } from '../services/api';
import { Boxes, AlertTriangle, Plus, Minus } from 'lucide-react';

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const res = await inventoryAPI.getInventoryList();
      if (res.data.success) {
        setInventory(res.data.data.inventory);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStockAdjust = async (id, action, quantity) => {
    try {
      await inventoryAPI.updateStock(id, { action, quantity });
      loadInventory();
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="flex-1 bg-slate-50 min-h-screen">
      <Header title="Warehouse Inventory Control" />

      <main className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-extrabold text-lg text-slate-900">Inventory Items ({inventory.length})</h2>
            <p className="text-xs text-slate-500">Live stock levels & low stock alerts</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3">SKU / Item</th>
                <th className="p-3">Category</th>
                <th className="p-3">Current Stock</th>
                <th className="p-3">Min Threshold</th>
                <th className="p-3">Status Alert</th>
                <th className="p-3 text-right">Quick Adjust Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inventory.map((inv) => {
                const prod = inv.product || {};
                const isLow = inv.currentQuantity <= inv.minStockThreshold;

                return (
                  <tr key={inv._id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <span className="font-bold text-slate-900 block">{prod.name || inv.SKU}</span>
                      <span className="text-[10px] text-slate-400">SKU: {inv.SKU}</span>
                    </td>
                    <td className="p-3 font-semibold text-slate-700">{prod.categoryName || 'N/A'}</td>
                    <td className="p-3 font-extrabold text-slate-900 text-sm">
                      {inv.currentQuantity} {inv.unit}
                    </td>
                    <td className="p-3 text-slate-600">{inv.minStockThreshold} {inv.unit}</td>
                    <td className="p-3">
                      {isLow ? (
                        <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-1 rounded-full inline-flex items-center">
                          <AlertTriangle className="w-3 h-3 mr-1 text-red-600" />
                          LOW STOCK
                        </span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-1 rounded-full">
                          Optimal Stock
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => handleStockAdjust(inv._id, 'subtract', 5)}
                        className="px-2 py-1 bg-slate-100 border text-slate-700 rounded-lg font-bold hover:bg-slate-200"
                      >
                        -5
                      </button>
                      <button
                        onClick={() => handleStockAdjust(inv._id, 'add', 20)}
                        className="px-2 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg font-bold hover:bg-emerald-100"
                      >
                        +20
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
