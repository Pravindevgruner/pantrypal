const ExpiryItem = require('../models/ExpiryItem');
const { runExpiryMonitoring } = require('../services/expiryEngineService');
const { getExpiryStatus } = require('../utils/expiryCalculator');
const { sendSuccess, sendError } = require('../utils/response');

const getCustomerExpiryItems = async (req, res) => {
  try {
    const items = await ExpiryItem.find({ customerId: req.user._id }).sort({ expiryDate: 1 });

    const formatted = items.map((item) => {
      const { status: currentStatus, daysRemaining } = getExpiryStatus(
        item.expiryDate,
        item.consumedQuantity,
        item.discardedQuantity,
        item.quantity
      );
      return {
        ...item.toObject(),
        status: currentStatus,
        daysRemaining,
        remainingQuantity: Math.max(0, item.quantity - (item.consumedQuantity + item.discardedQuantity)),
      };
    });

    const summary = {
      freshCount: formatted.filter((i) => i.status === 'FRESH').length,
      expiringSoonCount: formatted.filter((i) => i.status === 'EXPIRING_SOON').length,
      expiredCount: formatted.filter((i) => i.status === 'EXPIRED').length,
      consumedCount: formatted.filter((i) => i.status === 'CONSUMED').length,
      discardedCount: formatted.filter((i) => i.status === 'DISCARDED').length,
      totalCount: formatted.length,
    };

    return sendSuccess(res, 'Expiry items fetched', { items: formatted, summary });
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

const getFreshItems = async (req, res) => {
  try {
    const items = await ExpiryItem.find({ customerId: req.user._id, status: 'FRESH' }).sort({ expiryDate: 1 });
    return sendSuccess(res, 'Fresh items fetched', { items });
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

const getExpiringSoonItems = async (req, res) => {
  try {
    const items = await ExpiryItem.find({ customerId: req.user._id, status: 'EXPIRING_SOON' }).sort({ expiryDate: 1 });
    return sendSuccess(res, 'Expiring soon items fetched', { items });
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

const getExpiredItems = async (req, res) => {
  try {
    const items = await ExpiryItem.find({ customerId: req.user._id, status: 'EXPIRED' }).sort({ expiryDate: -1 });
    return sendSuccess(res, 'Expired items fetched', { items });
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

const markAsConsumed = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity = 1 } = req.body;

    const item = await ExpiryItem.findOne({ _id: id, customerId: req.user._id });
    if (!item) return sendError(res, 'Expiry record not found', {}, 404);

    const qtyToMark = Number(quantity);
    const availableToMark = item.quantity - (item.consumedQuantity + item.discardedQuantity);

    if (qtyToMark > availableToMark) {
      return sendError(res, `Cannot mark ${qtyToMark} as consumed. Remaining quantity is ${availableToMark}`, {}, 400);
    }

    item.consumedQuantity += qtyToMark;

    const { status } = getExpiryStatus(item.expiryDate, item.consumedQuantity, item.discardedQuantity, item.quantity);
    item.status = status;

    await item.save();

    return sendSuccess(res, 'Item consumption recorded', { item });
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

const markAsDiscarded = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity = 1 } = req.body;

    const item = await ExpiryItem.findOne({ _id: id, customerId: req.user._id });
    if (!item) return sendError(res, 'Expiry record not found', {}, 404);

    const qtyToMark = Number(quantity);
    const availableToMark = item.quantity - (item.consumedQuantity + item.discardedQuantity);

    if (qtyToMark > availableToMark) {
      return sendError(res, `Cannot mark ${qtyToMark} as discarded. Remaining quantity is ${availableToMark}`, {}, 400);
    }

    item.discardedQuantity += qtyToMark;

    const { status } = getExpiryStatus(item.expiryDate, item.consumedQuantity, item.discardedQuantity, item.quantity);
    item.status = status;

    await item.save();

    return sendSuccess(res, 'Item disposal recorded', { item });
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

const triggerExpiryCheck = async (req, res) => {
  try {
    const result = await runExpiryMonitoring();
    return sendSuccess(res, 'Expiry monitoring check executed successfully', result);
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

const getWastageInsights = async (req, res) => {
  try {
    const items = await ExpiryItem.find({ customerId: req.user._id });

    let totalPurchased = 0;
    let totalConsumed = 0;
    let totalDiscarded = 0;

    items.forEach((item) => {
      totalPurchased += item.quantity;
      totalConsumed += item.consumedQuantity;
      totalDiscarded += item.discardedQuantity;
    });

    const wastePercentage = totalPurchased > 0 ? ((totalDiscarded / totalPurchased) * 100).toFixed(1) : 0;
    const consumptionRate = totalPurchased > 0 ? ((totalConsumed / totalPurchased) * 100).toFixed(1) : 0;

    return sendSuccess(res, 'Wastage insights fetched', {
      totalPurchased,
      totalConsumed,
      totalDiscarded,
      wastePercentage: Number(wastePercentage),
      consumptionRate: Number(consumptionRate),
    });
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

module.exports = {
  getCustomerExpiryItems,
  getFreshItems,
  getExpiringSoonItems,
  getExpiredItems,
  markAsConsumed,
  markAsDiscarded,
  triggerExpiryCheck,
  getWastageInsights,
};
