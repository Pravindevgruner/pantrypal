import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { inventoryAPI, adminAPI } from '../services/api';
import {
  Boxes,
  AlertTriangle,
  Plus,
  Minus,
  Search,
  PackageCheck,
  CheckCircle2,
  X,
  Edit2,
  RefreshCw,
} from 'lucide-react';

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Custom Stock Adjust Modal
  const [adjustItem, setAdjustItem] = useState(null);
  const [adjustAction, setAdjustAction] = useState('add');
  const [adjustQty, setAdjustQty] = useState(10);
  const [editThreshold, setEditThreshold] = useState(10);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const res = await inventoryAPI.getInventoryList();
      if (res.data.success) {
        setInventory(res.data.data.inventory || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStockAdjust = async (id, action, quantity, minStockThreshold) => {
    try {
      await inventoryAPI.updateStock(id, {
        action,
        quantity,
        minStockThreshold,
      });
      loadInventory();
      if (adjustItem) setAdjustItem(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  const handleBulkRestock = async () => {
    try {
      const res = await adminAPI.bulkRestock({ restockQuantity: 50 });
      if (res.data.success) {
        alert(res.data.message || 'Restocked low inventory items!');
        loadInventory();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Bulk restock failed');
    }
  };

  const filteredInventory = inventory.filter((inv) => {
    const prod = inv.product || {};
    const isLow = inv.currentQuantity <= inv.minStockThreshold;
    const isOut = inv.currentQuantity === 0;

    if (filterStatus === 'LOW' && !isLow) return false;
    if (filterStatus === 'OUT' && !isOut) return false;
    if (filterStatus === 'OPTIMAL' && isLow) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = prod.name?.toLowerCase().includes(q);
      const matchSKU = inv.SKU?.toLowerCase().includes(q);
      return matchName || matchSKU;
    }
    return true;
  });

  const lowStockCount = inventory.filter((i) => i.currentQuantity <= i.minStockThreshold).length;
  const outOfStockCount = inventory.filter((i) => i.currentQuantity === 0).length;
  const totalUnits = inventory.reduce((a, c) => a + (c.currentQuantity || 0), 0);

  return (
    <div className="flex-1 bg-slate-50 min-h-screen">
      <Header
        title="Warehouse Inventory & Stock Control"
        subtitle="Live inventory counts, automated low-stock warnings & instant replenishment controls"
        onRefresh={loadInventory}
      />

      <main className="p-6 space-y-6">
        {/* Inventory Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total SKUs</span>
            <h3 className="text-2xl font-black text-slate-900">{inventory.length}</h3>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Total In Stock</span>
            <h3 className="text-2xl font-black text-emerald-950">{totalUnits.toLocaleString()} units</h3>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-orange-200 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider block">Low Stock Alert</span>
            <h3 className="text-2xl font-black text-orange-950">{lowStockCount} items</h3>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-red-200 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider block">Out of Stock</span>
            <h3 className="text-2xl font-black text-red-950">{outOfStockCount} items</h3>
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            {[
              { key: 'ALL', label: 'All Items' },
              { key: 'LOW', label: `Low Stock (${lowStockCount})` },
              { key: 'OUT', label: `Out of Stock (${outOfStockCount})` },
              { key: 'OPTIMAL', label: 'Optimal Stock' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterStatus(tab.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  filterStatus === tab.key
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-3 flex-1 max-w-md justify-end">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by SKU or Product Name..."
                className="w-full bg-slate-50 border border-slate-200 pl-9 pr-3 py-1.5 rounded-xl text-xs font-semibold focus:outline-none"
              />
            </div>

            <button
              onClick={handleBulkRestock}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs whitespace-nowrap transition"
            >
              <PackageCheck className="w-4 h-4" />
              <span>Bulk Restock (+50)</span>
            </button>
          </div>
        </div>

        {/* Inventory Items Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3">SKU / Grocery Item</th>
                <th className="p-3">Category</th>
                <th className="p-3">Current Stock</th>
                <th className="p-3">Min Threshold</th>
                <th className="p-3">Shelf Life</th>
                <th className="p-3">Stock Alert</th>
                <th className="p-3 text-right">Quick Stock Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400">
                    No inventory records match the current filter.
                  </td>
                </tr>
              ) : (
                filteredInventory.map((inv) => {
                  const prod = inv.product || {};
                  const isLow = inv.currentQuantity <= inv.minStockThreshold;
                  const isOut = inv.currentQuantity === 0;

                  return (
                    <tr key={inv._id} className="hover:bg-slate-50 transition">
                      <td className="p-3">
                        <div className="flex items-center space-x-2.5">
                          <img
                            src={prod.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=100&q=80'}
                            alt={prod.name}
                            className="w-8 h-8 rounded-lg object-cover border"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block">{prod.name || inv.SKU}</span>
                            <span className="text-[10px] text-slate-400 font-mono">SKU: {inv.SKU}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-semibold text-slate-700">{prod.categoryName || 'General'}</td>
                      <td className="p-3">
                        <span className="font-black text-slate-900 text-sm">
                          {inv.currentQuantity} {inv.unit}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 font-medium">
                        {inv.minStockThreshold} {inv.unit}
                      </td>
                      <td className="p-3">
                        <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded text-[10px]">
                          {prod.shelfLifeDays || 7} days
                        </span>
                      </td>
                      <td className="p-3">
                        {isOut ? (
                          <span className="bg-red-100 text-red-900 text-[10px] font-black px-2 py-0.5 rounded-full inline-flex items-center">
                            <AlertTriangle className="w-3 h-3 mr-1 text-red-700" />
                            OUT OF STOCK
                          </span>
                        ) : isLow ? (
                          <span className="bg-orange-100 text-orange-900 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center">
                            <AlertTriangle className="w-3 h-3 mr-1 text-orange-600" />
                            LOW STOCK
                          </span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center">
                            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                            Optimal
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => handleStockAdjust(inv._id, 'subtract', 5)}
                          title="Reduce 5 units"
                          className="px-2 py-1 bg-slate-100 border text-slate-700 rounded-lg font-bold hover:bg-slate-200 transition"
                        >
                          -5
                        </button>
                        <button
                          onClick={() => handleStockAdjust(inv._id, 'add', 20)}
                          title="Add 20 units"
                          className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg font-bold hover:bg-emerald-100 transition"
                        >
                          +20
                        </button>
                        <button
                          onClick={() => handleStockAdjust(inv._id, 'add', 50)}
                          title="Add 50 units"
                          className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition"
                        >
                          +50
                        </button>
                        <button
                          onClick={() => {
                            setAdjustItem(inv);
                            setAdjustAction('add');
                            setAdjustQty(25);
                            setEditThreshold(inv.minStockThreshold);
                          }}
                          title="Custom stock adjust & threshold"
                          className="p-1 text-slate-400 hover:text-slate-700 rounded transition inline-flex"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Custom Stock Adjustment & Threshold Modal */}
      {adjustItem && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Adjust Stock: {adjustItem.product?.name || adjustItem.SKU}
                </h3>
                <span className="text-[11px] text-slate-400">
                  Current: {adjustItem.currentQuantity} {adjustItem.unit}
                </span>
              </div>
              <button onClick={() => setAdjustItem(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Stock Adjustment Action</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'add', label: 'Add (+)' },
                    { key: 'subtract', label: 'Deduct (-)' },
                    { key: 'set', label: 'Set Exact' },
                  ].map((act) => (
                    <button
                      key={act.key}
                      onClick={() => setAdjustAction(act.key)}
                      className={`py-2 rounded-xl font-bold border transition ${
                        adjustAction === act.key
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {act.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Quantity ({adjustItem.unit})</label>
                <input
                  type="number"
                  min="1"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  className="w-full bg-slate-50 border p-2.5 rounded-xl font-bold text-base"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Minimum Stock Alert Threshold</label>
                <input
                  type="number"
                  min="0"
                  value={editThreshold}
                  onChange={(e) => setEditThreshold(e.target.value)}
                  className="w-full bg-slate-50 border p-2.5 rounded-xl font-semibold"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  onClick={() => setAdjustItem(null)}
                  className="flex-1 py-2.5 border rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    handleStockAdjust(
                      adjustItem._id,
                      adjustAction,
                      adjustQty,
                      Number(editThreshold)
                    )
                  }
                  className="flex-1 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-xs"
                >
                  Save Stock
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
