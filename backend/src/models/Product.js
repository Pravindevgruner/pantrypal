const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    categoryName: { type: String, default: '' },
    brand: { type: String, default: 'PantryPal Fresh' },
    image: { type: String, default: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80' },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, default: 0, min: 0 },
    stockQuantity: { type: Number, required: true, default: 100, min: 0 },
    unit: { type: String, default: 'kg' }, // kg, g, liter, pack, pcs
    weight: { type: String, default: '1 kg' },
    SKU: { type: String, required: true, unique: true, uppercase: true, trim: true },
    shelfLifeDays: { type: Number, required: true, default: 7 }, // Product shelf life in days
    isAvailable: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', brand: 'text', SKU: 1, category: 1 });

module.exports = mongoose.model('Product', productSchema);
