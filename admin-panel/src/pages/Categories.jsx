import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { categoryAPI } from '../services/api';
import { Plus, Trash2, Edit2, Grid } from 'lucide-react';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState(null);

  const [form, setForm] = useState({ name: '', description: '', image: '' });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await categoryAPI.getCategories();
      if (res.data.success) {
        setCategories(res.data.data.categories);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingCat(null);
    setForm({ name: '', description: '', image: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCat(cat);
    setForm({ name: cat.name, description: cat.description || '', image: cat.image || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCat) {
        await categoryAPI.updateCategory(editingCat._id, form);
      } else {
        await categoryAPI.createCategory(form);
      }
      setShowModal(false);
      loadCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete category?')) return;
    try {
      await categoryAPI.deleteCategory(id);
      loadCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="flex-1 bg-slate-50 min-h-screen">
      <Header title="Grocery Category Management" />

      <main className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-extrabold text-lg text-slate-900">Categories ({categories.length})</h2>
            <p className="text-xs text-slate-500">Manage grocery product categories</p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs hover:bg-emerald-700 flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Category</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat._id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
              <img src={cat.image} alt={cat.name} className="w-16 h-16 rounded-xl object-cover border" />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 text-sm">{cat.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-1">{cat.description || 'No description'}</p>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded mt-1 inline-block">
                  {cat.productCount} Products
                </span>
              </div>
              <div className="flex flex-col space-y-1">
                <button onClick={() => handleOpenEdit(cat)} className="p-1.5 text-slate-500 hover:text-emerald-600">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(cat._id)} className="p-1.5 text-slate-500 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="font-bold text-slate-900 text-base">
              {editingCat ? 'Edit Category' : 'Add Category'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-slate-50 border p-2.5 rounded-xl focus:outline-emerald-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Image URL</label>
                <input
                  type="text"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  className="w-full bg-slate-50 border p-2.5 rounded-xl focus:outline-emerald-500"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows="2"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-slate-50 border p-2.5 rounded-xl focus:outline-emerald-500"
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
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
