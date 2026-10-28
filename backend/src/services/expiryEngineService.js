const dayjs = require('dayjs');
const ExpiryItem = require('../models/ExpiryItem');
const Notification = require('../models/Notification');
const { getExpiryStatus } = require('../utils/expiryCalculator');

/**
 * Core Expiry Engine Processor
 * Processes all active expiry records, calculates status transitions, and sends notifications
 */
const runExpiryMonitoring = async () => {
  console.log('[Expiry Engine] Starting scheduled expiry calculation scan...');
  let processedCount = 0;
  let notificationsSent = 0;

  try {
    const items = await ExpiryItem.find({
      status: { $in: ['FRESH', 'EXPIRING_SOON'] },
    });

    for (const item of items) {
      processedCount++;
      const { status: calculatedStatus, daysRemaining } = getExpiryStatus(
        item.expiryDate,
        item.consumedQuantity,
        item.discardedQuantity,
        item.quantity
      );

      // Check if status needs updating
      if (item.status !== calculatedStatus) {
        item.status = calculatedStatus;
      }

      // Check notification thresholds: 7 days, 3 days, 1 day, 0 days (expiry day)
      const thresholds = [7, 3, 1, 0];
      for (const t of thresholds) {
        if (daysRemaining <= t && !item.remindersSent.includes(t)) {
          // Send notification
          let title = `Expiry Alert: ${item.productName}`;
          let message = '';

          if (daysRemaining < 0) {
            title = `Product Expired!`;
            message = `Your ${item.productName} expired ${Math.abs(daysRemaining)} days ago. Please check before consumption.`;
          } else if (daysRemaining === 0) {
            title = `Expires Today!`;
            message = `Your ${item.productName} expires today! Use it soon.`;
          } else if (daysRemaining === 1) {
            title = `Expires Tomorrow!`;
            message = `Your ${item.productName} will expire tomorrow.`;
          } else {
            message = `Your ${item.productName} will expire in ${daysRemaining} days.`;
          }

          // Send push & in-app notification via FCM Service
          const { sendExpiryReminder } = require('./fcmService');
          await sendExpiryReminder(item.customerId, item, daysRemaining);

          // Mark reminder as sent
          item.remindersSent.push(t);
          notificationsSent++;
          console.log(`[Expiry Alert] Notification sent to user ${item.customerId} for item '${item.productName}' (${daysRemaining} days remaining)`);
        }
      }

      await item.save();
    }

    console.log(`[Expiry Engine] Completed scan: ${processedCount} items processed, ${notificationsSent} notifications issued.`);
    return { processedCount, notificationsSent };
  } catch (error) {
    console.error(`[Expiry Engine Error] ${error.message}`);
    throw error;
  }
};

/**
 * Creates Expiry records when an order is created or delivered
 */
const createExpiryRecordsForOrder = async (order) => {
  try {
    if (!order || !order.items || order.items.length === 0) return [];

    // Avoid duplicate creation for the same order
    const existingCount = await ExpiryItem.countDocuments({ orderId: order._id });
    if (existingCount > 0) {
      console.log(`[Expiry Engine] Expiry records already exist for Order ${order.orderNumber}. Skipping duplicate creation.`);
      return await ExpiryItem.find({ orderId: order._id });
    }

    const purchaseDate = order.createdAt || new Date();
    const expiryRecords = [];

    for (const item of order.items) {
      const shelfLifeDays = item.shelfLifeDays || 7;
      const expiryDate = dayjs(purchaseDate).add(shelfLifeDays, 'day').endOf('day').toDate();

      const { status: initialStatus } = getExpiryStatus(expiryDate, 0, 0, item.quantity);

      const expiryRecord = await ExpiryItem.create({
        customerId: order.customer,
        productId: item.product,
        orderId: order._id,
        productName: item.productName,
        productImage: item.productImage || '',
        quantity: item.quantity,
        consumedQuantity: 0,
        discardedQuantity: 0,
        purchaseDate,
        shelfLifeDays,
        expiryDate,
        status: initialStatus,
        remindersSent: [],
      });
      expiryRecords.push(expiryRecord);
    }

    console.log(`[Expiry Engine] Created ${expiryRecords.length} expiry records for Order ${order.orderNumber}`);
    return expiryRecords;
  } catch (error) {
    console.error(`[Expiry Engine] Failed to create expiry records for order: ${error.message}`);
    return [];
  }
};

module.exports = {
  runExpiryMonitoring,
  createExpiryRecordsForOrder,
};
