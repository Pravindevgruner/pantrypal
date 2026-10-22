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
    const {
      addressId,
      deliveryAddress,
      items,
      deliverySlot = 'Instant (25-35 mins)',
      paymentMethod = 'COD',
      razorpayOrderId,
      razorpayPaymentId,
    } = req.body;

    let orderItems = [];
    let subtotal = 0;
    let deliveryFee = 0;
    let discount = 0;
    let totalAmount = 0;

    const userCart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (items && Array.isArray(items) && items.length > 0) {
      // Direct items payload (e.g. from mobile app or direct checkout)
      for (const item of items) {
        const pId = item.productId || item.product;
        const prod = pId ? await Product.findById(pId) : null;
        const qty = Number(item.quantity) || 1;
        const price = Number(item.price || item.unitPrice || prod?.discountPrice || prod?.price || 0);

        orderItems.push({
          product: prod ? prod._id : null,
          productName: item.name || item.productName || prod?.name || 'Grocery Item',
          productImage: item.image || item.productImage || prod?.image || '',
          quantity: qty,
          unitPrice: price,
          shelfLifeDays: item.shelfLifeDays || prod?.shelfLifeDays || 7,
        });
        subtotal += price * qty;
      }
      deliveryFee = subtotal > 499 || subtotal === 0 ? 0 : 40;
      totalAmount = subtotal + deliveryFee - discount;
    } else {
      // Cart-based payload
      if (!userCart || userCart.items.length === 0) {
        return sendError(res, 'Cart is empty. Cannot place order.', {}, 400);
      }

      for (const item of userCart.items) {
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

      subtotal = userCart.subtotal;
      discount = userCart.discount || 0;
      deliveryFee = userCart.deliveryFee || 0;
      totalAmount = userCart.totalAmount;
    }

    // Resolve Delivery Address
    let resolvedAddress = null;
    if (addressId) {
      resolvedAddress = await Address.findOne({ _id: addressId, user: req.user._id });
    }
    if (!resolvedAddress && deliveryAddress) {
      resolvedAddress = deliveryAddress;
    }
    if (!resolvedAddress) {
      resolvedAddress = (await Address.findOne({ user: req.user._id })) || {
        fullName: req.user.name || 'Valued Customer',
        phone: req.user.phone || '9876543210',
        houseFlat: 'Flat 402',
        street: '12th Cross, Indiranagar',
        area: 'Indiranagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560103',
      };
    }

    // Generate Order Number
    const orderNumber = 'PP-' + Math.floor(100000 + Math.random() * 900000);
    const paymentStatus = paymentMethod === 'COD' ? 'PENDING' : 'SUCCESSFUL';

    const order = await Order.create({
      orderNumber,
      customer: req.user._id,
      items: orderItems,
      address: {
        fullName: resolvedAddress.fullName || req.user.name,
        phone: resolvedAddress.phone || req.user.phone || '9876543210',
        houseFlat: resolvedAddress.houseFlat || '',
        street: resolvedAddress.street || 'Main Street',
        area: resolvedAddress.area || '',
        city: resolvedAddress.city || 'Bengaluru',
        state: resolvedAddress.state || 'Karnataka',
        pincode: resolvedAddress.pincode || '560103',
        latitude: resolvedAddress.latitude,
        longitude: resolvedAddress.longitude,
      },
      deliverySlot,
      subtotal,
      discount,
      deliveryFee,
      totalAmount,
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
      if (item.product) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stockQuantity: -item.quantity },
        });
        await Inventory.findOneAndUpdate({ product: item.product }, {
          $inc: { currentQuantity: -item.quantity },
        });
      }
    }

    // Clear Customer Cart if cart was used
    if (userCart) {
      userCart.items = [];
      userCart.subtotal = 0;
      userCart.discount = 0;
      userCart.deliveryFee = 0;
      userCart.totalAmount = 0;
      await userCart.save();
    }

    // Immediately initialize Smart Expiry records for the purchased groceries
    await createExpiryRecordsForOrder(order);

    // Create Notification
    await Notification.create({
      user: req.user._id,
      title: 'Order Placed Successfully!',
      message: `Your order #${order.orderNumber} for ₹${order.totalAmount} has been placed. Smart Expiry tracking has been activated for your items!`,
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

const getOrderInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('deliveryPartner', 'name phone');

    if (!order) return sendError(res, 'Order not found', {}, 404);

    if (req.user.role === 'CUSTOMER' && order.customer._id.toString() !== req.user._id.toString()) {
      return sendError(res, 'Access denied', {}, 403);
    }

    const subtotal = order.subtotal || order.totalAmount;
    const taxAmount = Math.round((subtotal * 0.05) * 100) / 100; // 5% GST
    const netAmount = subtotal - taxAmount;

    const invoice = {
      invoiceNumber: `INV-${order.orderNumber ? order.orderNumber.replace('PP-', '') : order._id.toString().slice(-6).toUpperCase()}`,
      orderNumber: order.orderNumber,
      orderId: order._id,
      invoiceDate: order.createdAt,
      placeOfSupply: `${order.address?.city || 'Bengaluru'}, ${order.address?.state || 'Karnataka'}`,
      seller: {
        legalName: 'PantryPal Technologies & Logistics Pvt Ltd',
        brandName: 'PantryPal Smart Grocery',
        gstin: '29AABCP9876F1Z5',
        fssaiLicense: '11223344000889',
        hubAddress: 'PantryPal Dark Store #14, 100 Feet Road, Indiranagar, Bengaluru, Karnataka - 560038',
        supportEmail: 'care@pantrypal.store',
        supportPhone: '+91 1800 200 4455',
      },
      customer: {
        name: order.address?.fullName || order.customer?.name || 'Valued Customer',
        phone: order.address?.phone || order.customer?.phone || '',
        email: order.customer?.email || '',
        shippingAddress: `${order.address?.houseFlat || ''}, ${order.address?.street || ''}, ${order.address?.area || ''}, ${order.address?.city || ''} - ${order.address?.pincode || ''}`,
      },
      items: order.items.map((it, idx) => ({
        srNo: idx + 1,
        name: it.productName,
        hsn: '0806' + (idx + 10),
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        shelfLifeDays: it.shelfLifeDays,
        itemTotal: it.quantity * it.unitPrice,
      })),
      pricing: {
        subtotal: order.subtotal,
        discount: order.discount || 0,
        deliveryFee: order.deliveryFee || 0,
        taxAmount,
        netTaxableAmount: netAmount,
        totalAmount: order.totalAmount,
      },
      payment: {
        method: order.paymentMethod,
        status: order.paymentStatus,
        transactionId: order.razorpayPaymentId || `TXN-PP-${Math.floor(10000000 + Math.random() * 90000000)}`,
        paidAt: order.paymentStatus === 'SUCCESSFUL' ? order.updatedAt : null,
      },
      smartExpiryInfo: {
        message: 'All items in this invoice have been automatically enrolled in your Smart Expiry Tracker with dynamic freshness countdowns.',
      },
    };

    return sendSuccess(res, 'Invoice generated successfully', { invoice });
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
  getOrderInvoice,
};
