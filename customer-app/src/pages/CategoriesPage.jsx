import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import { categoryAPI, productAPI } from '../services/api';
import { Filter, ArrowUpDown } from 'lucide-react';

export default function CategoriesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCatId = searchParams.get('selected') || '';

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState(selectedCatId);
  const [sortOption, setSortOption] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeCategory, sortOption]);

  const loadData = async () => {
    setLoading(true);
    try {
      const catRes = await categoryAPI.getCategories();
      if (catRes.data.success) {
        setCategories(catRes.data.data.categories);
      }

      const params = {};
      if (activeCategory) params.category = activeCategory;
      if (sortOption) params.sort = sortOption;

      const prodRes = await productAPI.getProducts(params);
      if (prodRes.data.success) {
        setProducts(prodRes.data.data.products);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (id) => {
    setActiveCategory(id);
    setSearchParams(id ? { selected: id } : {});
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pb-24 max-w-md mx-auto min-h-screen bg-gray-50">
      <Navbar searchValue={searchQuery} onSearchChange={setSearchQuery} />

      <div className="px-4 py-3">
        {/* Category Horizontal Filter Chips */}
        <div className="flex space-x-2 overflow-x-auto no-scrollbar py-2 mb-3">
          <button
            onClick={() => handleCategorySelect('')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              !activeCategory ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            All Items
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => handleCategorySelect(cat._id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                activeCategory === cat._id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-gray-700 border border-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Sort Bar */}
        <div className="flex items-center justify-between mb-3 text-xs text-gray-600 bg-white p-2.5 rounded-xl border border-gray-100 shadow-xs">
          <div className="flex items-center space-x-1">
            <Filter className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-semibold">{filteredProducts.length} Items</span>
          </div>

          <div className="flex items-center space-x-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="bg-transparent font-medium focus:outline-none text-xs"
            >
              <option value="">Sort by: Default</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A-Z</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white h-48 rounded-2xl animate-pulse p-3">
                <div className="bg-gray-200 h-28 rounded-xl mb-2"></div>
                <div className="bg-gray-200 h-4 rounded w-3/4 mb-1"></div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
            <p className="text-sm font-semibold text-gray-700">No products found</p>
            <p className="text-xs text-gray-500 mt-1">Try selecting a different category or clearing filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
