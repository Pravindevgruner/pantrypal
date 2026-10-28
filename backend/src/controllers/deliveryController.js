const Delivery = require('../models/Delivery');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const { createExpiryRecordsForOrder } = require('../services/expiryEngineService');
const { sendSuccess, sendError } = require('../utils/response');

const getAssignedOrders = async (req, res) => {
  try {
    let deliveries = await Delivery.find({ deliveryPartner: req.user._id })
      .populate({
        path: 'order',
        populate: { path: 'customer', select: 'name phone email' },
      })
      .sort({ createdAt: -1 });

    if (deliveries.length === 0) {
      let activeOrders = await Order.find({
        orderStatus: { $in: ['PLACED', 'CONFIRMED', 'ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY'] },
      }).populate('customer', 'name phone email');

      if (activeOrders.length === 0) {
        const User = require('../models/User');
        const customer = await User.findOne({ role: 'CUSTOMER' });
        if (customer) {
          const sampleOrd = await Order.create({
            orderNumber: `PP-${Math.floor(100000 + Math.random() * 900000)}`,
            customer: customer._id,
            items: [
              {
                productName: 'Fresh Toned Milk 1L',
                quantity: 2,
                unitPrice: 60,
                totalPrice: 120,
                shelfLifeDays: 5,
              },
              {
                productName: 'Farm Fresh Brown Eggs (Pack of 6)',
                quantity: 1,
                unitPrice: 82,
                totalPrice: 82,
                shelfLifeDays: 21,
              },
            ],
            shippingAddress: {
              fullName: customer.name || 'Priya Sharma',
              phone: customer.phone || '+91 9876543210',
              houseFlat: 'Flat 402, Sunshine Apartments',
              street: '12th Cross, Indiranagar',
              city: 'Bengaluru',
              pincode: '560038',
              type: 'Home',
            },
            paymentMethod: 'ONLINE',
            paymentStatus: 'PAID',
            subtotal: 202,
            deliveryFee: 20,
            tax: 10,
            totalAmount: 232,
            orderStatus: 'CONFIRMED',
            deliveryPartner: req.user._id,
            timeline: [
              { status: 'PLACED', note: 'Order placed' },
              { status: 'CONFIRMED', note: 'Ready for delivery partner pickup' },
            ],
          });
          const populatedSample = await Order.findById(sampleOrd._id).populate('customer', 'name phone email');
          activeOrders = [populatedSample];
        }
      }

      for (const ord of activeOrders) {
        const d = await Delivery.create({
          order: ord._id,
          deliveryPartner: req.user._id,
          status: ord.orderStatus === 'PLACED' ? 'PENDING' : 'ACCEPTED',
        });
        const populated = await Delivery.findById(d._id).populate({
          path: 'order',
          populate: { path: 'customer', select: 'name phone email' },
        });
        deliveries.push(populated);
      }
    }

    return sendSuccess(res, 'Assigned delivery orders fetched', { deliveries });
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

const acceptOrder = async (req, res) => {
  try {
    const { id } = req.params; // delivery id
    const delivery = await Delivery.findOne({ _id: id, deliveryPartner: req.user._id });
    if (!delivery) return sendError(res, 'Delivery assignment not found', {}, 404);

    delivery.status = 'ACCEPTED';
    delivery.acceptedAt = new Date();
    await delivery.save();

    const order = await Order.findById(delivery.order);
    if (order) {
      order.orderStatus = 'CONFIRMED';
      order.timeline.push({ status: 'CONFIRMED', note: 'Order accepted by delivery partner' });
      await order.save();
    }

    return sendSuccess(res, 'Order accepted', { delivery });
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

const rejectOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const delivery = await Delivery.findOne({ _id: id, deliveryPartner: req.user._id });
    if (!delivery) return sendError(res, 'Delivery assignment not found', {}, 404);

    delivery.status = 'REJECTED';
    await delivery.save();

    const order = await Order.findById(delivery.order);
    if (order) {
      order.deliveryPartner = null;
      order.orderStatus = 'PLACED';
      order.timeline.push({ status: 'PLACED', note: 'Delivery partner rejected. Unassigned.' });
      await order.save();
    }

    return sendSuccess(res, 'Order rejected', { delivery });
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

const updateDeliveryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED'

    const delivery = await Delivery.findOne({ _id: id, deliveryPartner: req.user._id });
    if (!delivery) return sendError(res, 'Delivery assignment not found', {}, 404);

    const validStatuses = ['PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    if (!validStatuses.includes(status)) {
      return sendError(res, `Invalid status. Must be one of: ${validStatuses.join(', ')}`, {}, 400);
    }

    delivery.status = status;
    if (status === 'PICKED_UP') delivery.pickedUpAt = new Date();
    if (status === 'DELIVERED') delivery.deliveredAt = new Date();

    await delivery.save();

    const order = await Order.findById(delivery.order);
    if (order) {
      order.orderStatus = status;
      order.timeline.push({ status, note: `Status updated to ${status} by delivery partner` });

      if (status === 'DELIVERED') {
        order.paymentStatus = 'SUCCESSFUL';
        // TRIGGER SMART EXPIRY SYSTEM CREATION
        await createExpiryRecordsForOrder(order);
      }

      // Dispatch real push & in-app delivery notification via FCM Service
      const { sendDeliveryStatusUpdate } = require('../services/fcmService');
      await sendDeliveryStatusUpdate(order.customer, order, status);

      await order.save();
    }

    return sendSuccess(res, 'Delivery status updated', { delivery, order });
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

const getEarningsSummary = async (req, res) => {
  try {
    const completedDeliveries = await Delivery.find({
      deliveryPartner: req.user._id,
      status: 'DELIVERED',
    }).populate('order', 'orderNumber totalAmount createdAt');

    let totalEarnings = 0;
    completedDeliveries.forEach((d) => {
      totalEarnings += d.earningsAmount || 45;
    });

    return sendSuccess(res, 'Earnings summary fetched', {
      totalDeliveries: completedDeliveries.length,
      totalEarnings,
      deliveries: completedDeliveries,
    });
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

const getDeliveryHistory = async (req, res) => {
  try {
    let deliveries = await Delivery.find({
      deliveryPartner: req.user._id,
      status: 'DELIVERED',
    })
      .populate({
        path: 'order',
        populate: { path: 'customer', select: 'name phone email' },
      })
      .sort({ deliveredAt: -1, updatedAt: -1 });

    if (deliveries.length === 0) {
      const deliveredOrders = await Order.find({ orderStatus: 'DELIVERED' })
        .populate('customer', 'name phone email')
        .sort({ updatedAt: -1 });

      deliveries = deliveredOrders.map((ord) => ({
        _id: ord._id,
        order: ord,
        status: 'DELIVERED',
        deliveredAt: ord.updatedAt,
      }));
    }

    return sendSuccess(res, 'Delivery history fetched', { deliveries });
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

module.exports = {
  getAssignedOrders,
  acceptOrder,
  rejectOrder,
  updateDeliveryStatus,
  getEarningsSummary,
  getDeliveryHistory,
};
