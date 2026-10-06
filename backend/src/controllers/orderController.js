const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const Address = require('../models/Address');
const Delivery = require('../models/Delivery');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { createExpiryRecordsForOrder } = require('../services/expiryEngineService');
const { sendSuccess, sendError } = require('../utils/response');

const createOrder = async (req, res) => {
  try {
    const { addressId, paymentMethod = 'COD', razorpayOrderId, razorpayPaymentId } = req.body;

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return sendError(res, 'Cart is empty. Cannot place order.', {}, 400);
    }

    const address = await Address.findOne({ _id: addressId, user: req.user._id });
    if (!address) {
      return sendError(res, 'Delivery address not found', {}, 404);
    }

    // Validate stock for all items
    const orderItems = [];
    for (const item of cart.items) {
      const prod = item.product;
      if (!prod || !prod.isActive) {
        return sendError(res, `Product ${item.product ? item.product.name : 'item'} is no longer available`, {}, 400);
      }
      if (prod.stockQuantity < item.quantity) {
        return sendError(res, `Insufficient stock for product ${prod.name}. Available: ${prod.stockQuantity}`, {}, 400);
      }

      orderItems.push({
        product: prod._id,
        productName: prod.name,
        productImage: prod.image,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        shelfLifeDays: prod.shelfLifeDays || 7,
      });
    }

    // Generate Order Number
    const orderNumber = 'PP-' + Math.floor(100000 + Math.random() * 900000);

    const paymentStatus = paymentMethod === 'COD' ? 'PENDING' : 'SUCCESSFUL';

    const order = await Order.create({
      orderNumber,
      customer: req.user._id,
      items: orderItems,
      address: {
        fullName: address.fullName,
        phone: address.phone,
        houseFlat: address.houseFlat,
        street: address.street,
        area: address.area,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        latitude: address.latitude,
        longitude: address.longitude,
      },
      subtotal: cart.subtotal,
      discount: cart.discount,
      deliveryFee: cart.deliveryFee,
      totalAmount: cart.totalAmount,
      paymentMethod,
      paymentStatus,
      orderStatus: 'PLACED',
      razorpayOrderId: razorpayOrderId || '',
      razorpayPaymentId: razorpayPaymentId || '',
      timeline: [
        { status: 'PLACED', note: 'Order placed by customer' },
      ],
    });

    // Deduct stock quantity & update inventory
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stockQuantity: -item.quantity },
      });
      await Inventory.findOneAndUpdate({ product: item.product }, {
        $inc: { currentQuantity: -item.quantity },
      });
    }

    // Clear Customer Cart
    cart.items = [];
    cart.subtotal = 0;
    cart.discount = 0;
    cart.deliveryFee = 0;
    cart.totalAmount = 0;
    await cart.save();

    // Create Notification
    await Notification.create({
      user: req.user._id,
      title: 'Order Placed Successfully!',
      message: `Your order #${order.orderNumber} for ₹${order.totalAmount} has been placed.`,
      type: 'ORDER',
      referenceId: order._id.toString(),
    });

    return sendSuccess(res, 'Order created successfully', { order }, 201);
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

const getCustomerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
    return sendSuccess(res, 'Customer orders fetched', { orders });
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('deliveryPartner', 'name phone profileImage');

    if (!order) return sendError(res, 'Order not found', {}, 404);

    // Ensure customer can only view own order, admin/delivery can view allowed orders
    if (req.user.role === 'CUSTOMER' && order.customer._id.toString() !== req.user._id.toString()) {
      return sendError(res, 'Access denied', {}, 403);
    }

    return sendSuccess(res, 'Order details fetched', { order });
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, customer: req.user._id });
    if (!order) return sendError(res, 'Order not found', {}, 404);

    if (['DELIVERED', 'OUT_FOR_DELIVERY', 'CANCELLED'].includes(order.orderStatus)) {
      return sendError(res, `Cannot cancel order in ${order.orderStatus} status`, {}, 400);
    }

    order.orderStatus = 'CANCELLED';
    order.timeline.push({ status: 'CANCELLED', note: 'Order cancelled by customer' });
    await order.save();

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stockQuantity: item.quantity },
      });
      await Inventory.findOneAndUpdate({ product: item.product }, {
        $inc: { currentQuantity: item.quantity },
      });
    }

    return sendSuccess(res, 'Order cancelled successfully', { order });
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

// Admin Functions
const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.orderStatus = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments(query);

    const orders = await Order.find(query)
      .populate('customer', 'name email phone')
      .populate('deliveryPartner', 'name phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return sendSuccess(res, 'All orders fetched', {
      orders,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note, deliveryPartnerId } = req.body;

    const order = await Order.findById(id);
    if (!order) return sendError(res, 'Order not found', {}, 404);

    if (status) {
      order.orderStatus = status;
      order.timeline.push({ status, note: note || `Order updated to ${status}` });

      if (status === 'DELIVERED') {
        order.paymentStatus = 'SUCCESSFUL';
        // TRIGGER SMART EXPIRY ENGINE AUTOMATIC RECORD CREATION
        await createExpiryRecordsForOrder(order);

        await Notification.create({
          user: order.customer,
          title: 'Order Delivered!',
          message: `Your grocery order #${order.orderNumber} has been delivered. Smart Expiry tracking has been activated!`,
          type: 'ORDER',
          referenceId: order._id.toString(),
        });
      }
    }

    if (deliveryPartnerId) {
      const partner = await User.findOne({ _id: deliveryPartnerId, role: 'DELIVERY_PARTNER' });
      if (!partner) return sendError(res, 'Invalid delivery partner', {}, 400);

      order.deliveryPartner = partner._id;
      order.orderStatus = 'ASSIGNED';
      order.timeline.push({ status: 'ASSIGNED', note: `Assigned to delivery partner ${partner.name}` });

      // Create or update Delivery Record
      await Delivery.findOneAndUpdate(
        { order: order._id },
        {
          order: order._id,
          deliveryPartner: partner._id,
          status: 'ASSIGNED',
          deliveryLocation: {
            address: `${order.address.houseFlat}, ${order.address.area}, ${order.address.city}`,
            latitude: order.address.latitude,
            longitude: order.address.longitude,
          },
        },
        { upsert: true }
      );

      await Notification.create({
        user: partner._id,
        title: 'New Delivery Assigned!',
        message: `You have been assigned order #${order.orderNumber}`,
        type: 'DELIVERY',
        referenceId: order._id.toString(),
      });
    }

    await order.save();
    return sendSuccess(res, 'Order status updated', { order });
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

module.exports = {
  createOrder,
  getCustomerOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
};
