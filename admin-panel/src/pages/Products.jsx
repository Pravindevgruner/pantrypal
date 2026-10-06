import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { productAPI, categoryAPI } from '../services/api';
import { Plus, Edit2, Trash2, Clock, Search } from 'lucide-react';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProd, setEditingProd] = useState(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    brand: 'PantryPal Fresh',
    image: '',
    price: '',
    discountPrice: '',
    stockQuantity: 100,
    unit: 'kg',
    weight: '1 kg',
    SKU: '',
    shelfLifeDays: 7,
  });

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await productAPI.getProducts({ limit: 100 });
      if (res.data.success) {
        setProducts(res.data.data.products);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await categoryAPI.getCategories();
      if (res.data.success) setCategories(res.data.data.categories);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenAdd = () => {
    setEditingProd(null);
    setForm({
      name: '',
      description: '',
      category: categories[0]?._id || '',
      brand: 'PantryPal Fresh',
      image: '',
      price: '',
      discountPrice: '',
      stockQuantity: 100,
      unit: 'kg',
      weight: '1 kg',
      SKU: 'GROC-' + Math.floor(100 + Math.random() * 900),
      shelfLifeDays: 7,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingProd(prod);
    setForm({
      name: prod.name,
      description: prod.description || '',
      category: prod.category?._id || prod.category,
      brand: prod.brand || 'PantryPal Fresh',
      image: prod.image || '',
      price: prod.price,
      discountPrice: prod.discountPrice || '',
      stockQuantity: prod.stockQuantity,
      unit: prod.unit || 'kg',
      weight: prod.weight || '1 kg',
      SKU: prod.SKU,
      shelfLifeDays: prod.shelfLifeDays || 7,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProd) {
        await productAPI.updateProduct(editingProd._id, form);
      } else {
        await productAPI.createProduct(form);
      }
      setShowModal(false);
      loadProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete product?')) return;
    try {
      await productAPI.deleteProduct(id);
      loadProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const filtered = products.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex-1 bg-slate-50 min-h-screen">
      <Header title="Product Catalog & Shelf-Life Configuration" />

      <main className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <input
              type="text"
              placeholder="Search by product name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs w-64 focus:outline-emerald-500"
            />
          </div>

          <button
            onClick={handleOpenAdd}
            className="bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs hover:bg-emerald-700 flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>Add Grocery Product</span>
          </button>
        </div>

        {/* Product Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3">Category</th>
                <th className="p-3">Price</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Configured Shelf Life</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((prod) => (
                <tr key={prod._id} className="hover:bg-slate-50">
                  <td className="p-3 flex items-center space-x-3">
                    <img src={prod.image} alt={prod.name} className="w-10 h-10 object-cover rounded-lg border" />
                    <div>
                      <span className="font-bold text-slate-900 block">{prod.name}</span>
                      <span className="text-[10px] text-slate-400">SKU: {prod.SKU}</span>
                    </div>
                  </td>
                  <td className="p-3 font-semibold text-slate-700">{prod.categoryName}</td>
                  <td className="p-3 font-extrabold text-slate-900">₹{prod.discountPrice > 0 ? prod.discountPrice : prod.price}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${prod.stockQuantity > 20 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {prod.stockQuantity} {prod.unit}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="bg-amber-50 text-amber-900 border border-amber-200 px-2 py-1 rounded-lg font-bold text-[11px] inline-flex items-center">
                      <Clock className="w-3 h-3 text-amber-600 mr-1" />
                      {prod.shelfLifeDays} Days
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <button onClick={() => handleOpenEdit(prod)} className="p-1.5 text-slate-500 hover:text-emerald-600">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(prod._id)} className="p-1.5 text-slate-500 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4 my-8">
            <h3 className="font-bold text-slate-900 text-base">
              {editingProd ? 'Edit Product & Shelf Life' : 'Add New Grocery Product'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-slate-50 border p-2.5 rounded-xl focus:outline-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">SKU</label>
                  <input
                    type="text"
                    required
                    value={form.SKU}
                    onChange={(e) => setForm({ ...form, SKU: e.target.value })}
                    className="w-full bg-slate-50 border p-2.5 rounded-xl focus:outline-emerald-500 uppercase font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-slate-50 border p-2.5 rounded-xl focus:outline-emerald-500 font-semibold"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-emerald-800 mb-1 font-bold">Shelf Life (Days)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={form.shelfLifeDays}
                    onChange={(e) => setForm({ ...form, shelfLifeDays: Number(e.target.value) })}
                    className="w-full bg-amber-50 border border-amber-300 p-2.5 rounded-xl focus:outline-amber-500 font-extrabold text-amber-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    className="w-full bg-slate-50 border p-2.5 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Discount Price (₹)</label>
                  <input
                    type="number"
                    value={form.discountPrice}
                    onChange={(e) => setForm({ ...form, discountPrice: Number(e.target.value) })}
                    className="w-full bg-slate-50 border p-2.5 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={form.stockQuantity}
                    onChange={(e) => setForm({ ...form, stockQuantity: Number(e.target.value) })}
                    className="w-full bg-slate-50 border p-2.5 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Image URL</label>
                <input
                  type="text"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  className="w-full bg-slate-50 border p-2.5 rounded-xl"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700"
                >
                  Save Product & Shelf-Life
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
