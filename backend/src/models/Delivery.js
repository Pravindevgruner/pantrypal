const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
    deliveryPartner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['ASSIGNED', 'ACCEPTED', 'REJECTED', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED'],
      default: 'ASSIGNED',
    },
    pickupLocation: {
      address: { type: String, default: 'PantryPal Central Fulfillment Center, Hub 42, Metro Road' },
      latitude: { type: Number, default: 28.6120 },
      longitude: { type: Number, default: 77.2080 },
    },
    deliveryLocation: {
      address: { type: String, default: '' },
      latitude: { type: Number, default: 28.6139 },
      longitude: { type: Number, default: 77.2090 },
    },
    acceptedAt: Date,
    pickedUpAt: Date,
    deliveredAt: Date,
    earningsAmount: { type: Number, default: 45 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Delivery', deliverySchema);
