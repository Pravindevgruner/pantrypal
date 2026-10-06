const mongoose = require('mongoose');

const expiryItemSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    productName: { type: String, required: true },
    productImage: { type: String, default: '' },
    unit: { type: String, default: 'pcs' },
    quantity: { type: Number, required: true, default: 1 },
    consumedQuantity: { type: Number, default: 0 },
    discardedQuantity: { type: Number, default: 0 },
    purchaseDate: { type: Date, required: true, default: Date.now },
    shelfLifeDays: { type: Number, required: true },
    expiryDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['FRESH', 'EXPIRING_SOON', 'EXPIRED', 'CONSUMED', 'DISCARDED'],
      default: 'FRESH',
    },
    remindersSent: [{ type: Number }], // e.g. [7, 3, 1, 0]
  },
  { timestamps: true }
);

expiryItemSchema.index({ customerId: 1, status: 1, expiryDate: 1 });

module.exports = mongoose.model('ExpiryItem', expiryItemSchema);
