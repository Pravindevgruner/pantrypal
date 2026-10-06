const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, unique: true },
    SKU: { type: String, required: true },
    currentQuantity: { type: Number, required: true, default: 100 },
    minStockThreshold: { type: Number, required: true, default: 10 },
    maxStockThreshold: { type: Number, required: true, default: 500 },
    unit: { type: String, default: 'pcs' },
    lastRestocked: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Inventory', inventorySchema);
