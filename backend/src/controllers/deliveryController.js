const Delivery = require('../models/Delivery');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const { createExpiryRecordsForOrder } = require('../services/expiryEngineService');
const { sendSuccess, sendError } = require('../utils/response');

const getAssignedOrders = async (req, res) => {
  try {
    const deliveries = await Delivery.find({ deliveryPartner: req.user._id })
      .populate({
        path: 'order',
        populate: { path: 'customer', select: 'name phone email' },
      })
      .sort({ createdAt: -1 });

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

        await Notification.create({
          user: order.customer,
          title: 'Order Delivered!',
          message: `Your grocery order #${order.orderNumber} has been delivered. Your Smart Expiry tracker is active!`,
          type: 'ORDER',
          referenceId: order._id.toString(),
        });
      } else {
        await Notification.create({
          user: order.customer,
          title: `Order Status: ${status.replace(/_/g, ' ')}`,
          message: `Your order #${order.orderNumber} status is now ${status.replace(/_/g, ' ')}.`,
          type: 'ORDER',
          referenceId: order._id.toString(),
        });
      }

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

module.exports = {
  getAssignedOrders,
  acceptOrder,
  rejectOrder,
  updateDeliveryStatus,
  getEarningsSummary,
};
