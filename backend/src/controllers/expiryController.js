const ExpiryItem = require('../models/ExpiryItem');
const { runExpiryMonitoring } = require('../services/expiryEngineService');
const { getExpiryStatus, calculateExpiryDate } = require('../utils/expiryCalculator');
const { sendSuccess, sendError } = require('../utils/response');

const getCustomerExpiryItems = async (req, res) => {
  try {
    const { status, search } = req.query;
    const query = { customerId: req.user._id };

    if (search) {
      query.productName = { $regex: search, $options: 'i' };
    }

    const items = await ExpiryItem.find(query).sort({ expiryDate: 1 });

    const formatted = items.map((item) => {
      const { status: currentStatus, daysRemaining } = getExpiryStatus(
        item.expiryDate,
        item.consumedQuantity,
        item.discardedQuantity,
        item.quantity
      );
      return {
        ...item.toObject(),
        itemName: item.productName,
        purchasedDate: item.purchaseDate,
        estimatedExpiryDate: item.expiryDate,
        location: item.category?.toLowerCase().includes('dairy') ||
                  item.category?.toLowerCase().includes('meat') ||
                  item.category?.toLowerCase().includes('veg') ||
                  item.category?.toLowerCase().includes('fruit')
                    ? 'Fridge'
                    : 'Pantry',
        status: currentStatus,
        daysRemaining,
        remainingQuantity: Math.max(0, item.quantity - (item.consumedQuantity + item.discardedQuantity)),
      };
    });

    let result = formatted;
    if (status && status !== 'ALL') {
      result = formatted.filter((i) => i.status === status);
    }

    const summary = {
      freshCount: formatted.filter((i) => i.status === 'FRESH').length,
      expiringSoonCount: formatted.filter((i) => i.status === 'EXPIRING_SOON').length,
      expiredCount: formatted.filter((i) => i.status === 'EXPIRED').length,
      consumedCount: formatted.filter((i) => i.status === 'CONSUMED').length,
      discardedCount: formatted.filter((i) => i.status === 'DISCARDED').length,
      totalCount: formatted.length,
    };

    return sendSuccess(res, 'Expiry items fetched', { items: result, summary });
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

const addExpiryItem = async (req, res) => {
  try {
    const {
      productName,
      itemName,
      quantity = 1,
      unit = 'pcs',
      shelfLifeDays = 7,
      purchaseDate,
      purchasedDate,
      productImage,
      category = 'Household Grocery',
      notes = '',
      productId = null,
      location = 'Pantry',
    } = req.body;

    const resolvedName = (productName || itemName || '').trim();
    if (!resolvedName) {
      return sendError(res, 'Please provide a valid product name', {}, 400);
    }

    const parsedShelfLife = Math.max(1, Number(shelfLifeDays) || 7);
    const parsedPurchaseDate = new Date(purchaseDate || purchasedDate || Date.now());
    const expiryDate = calculateExpiryDate(parsedPurchaseDate, parsedShelfLife);

    const { status } = getExpiryStatus(expiryDate, 0, 0, Number(quantity) || 1);

    const item = await ExpiryItem.create({
      customerId: req.user._id,
      productId: productId || null,
      orderId: null,
      productName: resolvedName,
      productImage: productImage || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
      category,
      unit,
      quantity: Math.max(1, Number(quantity) || 1),
      consumedQuantity: 0,
      discardedQuantity: 0,
      purchaseDate: parsedPurchaseDate,
      shelfLifeDays: parsedShelfLife,
      expiryDate,
      status,
      notes: notes || `Storage: ${location}`,
      remindersSent: [],
    });

    const { daysRemaining } = getExpiryStatus(item.expiryDate, 0, 0, item.quantity);

    return sendSuccess(res, 'Item added to pantry & expiry tracker', {
      item: {
        ...item.toObject(),
        itemName: item.productName,
        purchasedDate: item.purchaseDate,
        estimatedExpiryDate: item.expiryDate,
        location,
        daysRemaining,
        remainingQuantity: item.quantity,
      },
    }, 201);
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

const updateExpiryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, shelfLifeDays, productName, notes, unit } = req.body;

    const item = await ExpiryItem.findOne({ _id: id, customerId: req.user._id });
    if (!item) return sendError(res, 'Expiry record not found', {}, 404);

    if (quantity !== undefined) item.quantity = Math.max(1, Number(quantity));
    if (productName !== undefined) item.productName = productName.trim();
    if (notes !== undefined) item.notes = notes;
    if (unit !== undefined) item.unit = unit;

    if (shelfLifeDays !== undefined && Number(shelfLifeDays) > 0) {
      item.shelfLifeDays = Number(shelfLifeDays);
      item.expiryDate = calculateExpiryDate(item.purchaseDate, item.shelfLifeDays);
    }

    const { status, daysRemaining } = getExpiryStatus(
      item.expiryDate,
      item.consumedQuantity,
      item.discardedQuantity,
      item.quantity
    );
    item.status = status;

    await item.save();

    return sendSuccess(res, 'Pantry item updated', {
      item: {
        ...item.toObject(),
        status,
        daysRemaining,
        remainingQuantity: Math.max(0, item.quantity - (item.consumedQuantity + item.discardedQuantity)),
      },
    });
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

const deleteExpiryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await ExpiryItem.findOne({ _id: id, customerId: req.user._id });
    if (!item) return sendError(res, 'Expiry record not found', {}, 404);

    await item.deleteOne();
    return sendSuccess(res, 'Item removed from pantry tracker');
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

    const { status, daysRemaining } = getExpiryStatus(item.expiryDate, item.consumedQuantity, item.discardedQuantity, item.quantity);
    item.status = status;

    await item.save();

    return sendSuccess(res, 'Item consumption recorded', {
      item: {
        ...item.toObject(),
        status,
        daysRemaining,
        remainingQuantity: Math.max(0, item.quantity - (item.consumedQuantity + item.discardedQuantity)),
      },
    });
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

    const { status, daysRemaining } = getExpiryStatus(item.expiryDate, item.consumedQuantity, item.discardedQuantity, item.quantity);
    item.status = status;

    await item.save();

    return sendSuccess(res, 'Item disposal recorded', {
      item: {
        ...item.toObject(),
        status,
        daysRemaining,
        remainingQuantity: Math.max(0, item.quantity - (item.consumedQuantity + item.discardedQuantity)),
      },
    });
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
  addExpiryItem,
  updateExpiryItem,
  deleteExpiryItem,
  getFreshItems,
  getExpiringSoonItems,
  getExpiredItems,
  markAsConsumed,
  markAsDiscarded,
  triggerExpiryCheck,
  getWastageInsights,
};
