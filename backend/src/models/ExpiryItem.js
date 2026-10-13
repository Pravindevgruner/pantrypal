const mongoose = require('mongoose');

const expiryItemSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: false, default: null },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: false, default: null },
    productName: { type: String, required: true },
    productImage: { type: String, default: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80' },
    category: { type: String, default: 'General Grocery' },
    unit: { type: String, default: 'pcs' },
    quantity: { type: Number, required: true, default: 1 },
    consumedQuantity: { type: Number, default: 0 },
    discardedQuantity: { type: Number, default: 0 },
    purchaseDate: { type: Date, required: true, default: Date.now },
    shelfLifeDays: { type: Number, required: true, default: 7 },
    expiryDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['FRESH', 'EXPIRING_SOON', 'EXPIRED', 'CONSUMED', 'DISCARDED'],
      default: 'FRESH',
    },
    notes: { type: String, default: '' },
    remindersSent: [{ type: Number }], // e.g. [7, 3, 1, 0]
  },
  { timestamps: true }
);

expiryItemSchema.index({ customerId: 1, status: 1, expiryDate: 1 });

module.exports = mongoose.model('ExpiryItem', expiryItemSchema);
