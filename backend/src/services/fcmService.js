const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const { getMessaging } = require('firebase-admin/messaging');
const User = require('../models/User');
const Notification = require('../models/Notification');

let fcmInitialized = false;
let messagingService = null;

// Attempt to load Firebase Service Account Key
try {
  let serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  
  if (!serviceAccountPath || !fs.existsSync(serviceAccountPath)) {
    // Check common local locations
    const localConfig = path.join(__dirname, '../../config/firebase-service-account.json');
    const rootFirebase = path.join(__dirname, '../../../Firebase/pantrypal-50044-7e061d31ba09.json');
    
    if (fs.existsSync(localConfig)) {
      serviceAccountPath = localConfig;
    } else if (fs.existsSync(rootFirebase)) {
      serviceAccountPath = rootFirebase;
    }
  }

  if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    
    let app;
    if (!admin.getApps().length) {
      app = admin.initializeApp({
        credential: admin.cert(serviceAccount),
        projectId: serviceAccount.project_id || 'pantrypal-50044',
      });
    } else {
      app = admin.getApps()[0];
    }
    messagingService = getMessaging(app);
    fcmInitialized = true;
    console.log(`[FCM Service] ✅ Firebase Admin SDK initialized for project: ${serviceAccount.project_id}`);
  } else {
    console.warn('[FCM Service] ⚠️ Service account file not found. Operating in local notification mode.');
  }
} catch (err) {
  console.warn('[FCM Service] ⚠️ Firebase Admin init notice:', err.message);
}

/**
 * Core notification dispatcher:
 * 1. Persists notification record in MongoDB for in-app notification center
 * 2. If user has an active FCM token, dispatches live push notification
 */
const sendNotification = async (userId, { title, message, type = 'ORDER', referenceId = '', data = {} }) => {
  try {
    // 1. Create in-app notification record in DB
    const notifRecord = await Notification.create({
      user: userId,
      title,
      message,
      type,
      referenceId: String(referenceId || ''),
    });

    // 2. Dispatch real FCM Push if user has token and FCM is initialized
    let fcmSent = false;
    if (fcmInitialized && userId) {
      const user = await User.findById(userId);
      if (user && user.fcmToken) {
        try {
          await messagingService.send({
            token: user.fcmToken,
            notification: {
              title,
              body: message,
            },
            data: {
              type,
              referenceId: String(referenceId || ''),
              click_action: 'FLUTTER_NOTIFICATION_CLICK',
              ...data,
            },
          });
          fcmSent = true;
          console.log(`[FCM Service] 📲 Push dispatched to user ${user.email} (${type})`);
        } catch (fcmErr) {
          console.warn(`[FCM Service] Failed to send push to token:`, fcmErr.message);
        }
      }
    }

    return {
      success: true,
      notification: notifRecord,
      fcmSent,
    };
  } catch (error) {
    console.error('[FCM Service Error]:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * 1. Order Confirmation Notifications
 */
const sendOrderConfirmation = async (userId, order) => {
  return sendNotification(userId, {
    title: 'Order Placed Successfully! 🛒',
    message: `Your grocery order #${order.orderNumber} for ₹${order.totalAmount} has been confirmed. Fresh groceries are being prepared!`,
    type: 'ORDER',
    referenceId: order._id,
    data: {
      orderId: String(order._id),
      orderNumber: String(order.orderNumber),
      totalAmount: String(order.totalAmount),
    },
  });
};

/**
 * 2. Payment Status Updates
 */
const sendPaymentStatusUpdate = async (userId, order, paymentMethod = 'Online') => {
  return sendNotification(userId, {
    title: 'Payment Confirmed! 💳',
    message: `Payment for Order #${order.orderNumber} was successfully verified via ${paymentMethod}.`,
    type: 'PAYMENT',
    referenceId: order._id,
    data: {
      orderId: String(order._id),
      orderNumber: String(order.orderNumber),
      paymentStatus: 'SUCCESSFUL',
    },
  });
};

/**
 * 3. Delivery Status Notifications
 */
const sendDeliveryStatusUpdate = async (userId, order, status, note = '') => {
  let title = 'Order Update 📦';
  let message = `Your order #${order.orderNumber} status changed to ${status}.`;

  if (status === 'CONFIRMED') {
    title = 'Order Confirmed by Store! 🏬';
    message = `Your grocery order #${order.orderNumber} has been verified and is being picked.`;
  } else if (status === 'ASSIGNED') {
    title = 'Delivery Partner Assigned! 🛵';
    message = `A delivery partner has been assigned to bring your order #${order.orderNumber}.`;
  } else if (status === 'PICKED_UP') {
    title = 'Order Picked Up! 📦';
    message = `Your order #${order.orderNumber} was picked up and is headed your way.`;
  } else if (status === 'OUT_FOR_DELIVERY') {
    title = 'Out for Delivery! 🚀';
    message = `Your delivery partner is nearby with order #${order.orderNumber}. Please be ready!`;
  } else if (status === 'DELIVERED') {
    title = 'Order Delivered! 🎉';
    message = `Your groceries for #${order.orderNumber} have arrived. Smart Expiry tracking has been activated for your items!`;
  } else if (status === 'CANCELLED') {
    title = 'Order Cancelled ❌';
    message = `Order #${order.orderNumber} was cancelled. ${note || ''}`.trim();
  }

  return sendNotification(userId, {
    title,
    message,
    type: 'DELIVERY',
    referenceId: order._id,
    data: {
      orderId: String(order._id),
      orderNumber: String(order.orderNumber),
      status,
    },
  });
};

/**
 * 4. Promotional Offers and Discounts
 */
const sendPromotionalOffer = async (userIdOrAll, { title, message, promoCode = 'FRESH20', discount = 20 }) => {
  if (userIdOrAll === 'ALL' || !userIdOrAll) {
    const customers = await User.find({ role: 'CUSTOMER', isActive: true });
    const results = [];
    for (const cust of customers) {
      const res = await sendNotification(cust._id, {
        title: title || '🎉 Special Grocery Offer Just For You!',
        message: message || `Enjoy ${discount}% OFF on your next order! Use code ${promoCode} at checkout.`,
        type: 'PROMO',
        referenceId: promoCode,
        data: { promoCode, discount: String(discount) },
      });
      results.push(res);
    }
    return { broadcastCount: results.length };
  } else {
    return sendNotification(userIdOrAll, {
      title: title || '🎉 Exclusive Grocery Discount!',
      message: message || `Enjoy ${discount}% OFF on your next order! Use code ${promoCode} at checkout.`,
      type: 'PROMO',
      referenceId: promoCode,
      data: { promoCode, discount: String(discount) },
    });
  }
};

/**
 * 5. Expiry Reminder Notifications
 */
const sendExpiryReminder = async (userId, expiryItem, daysRemaining) => {
  let title = `Expiry Alert: ${expiryItem.productName} ⏳`;
  let message = '';

  if (daysRemaining < 0) {
    title = `Product Expired! 🚨`;
    message = `Your ${expiryItem.productName} expired ${Math.abs(daysRemaining)} days ago. Please check before consumption.`;
  } else if (daysRemaining === 0) {
    title = `Expires Today! ⚠️`;
    message = `Your ${expiryItem.productName} expires today! Use it soon to prevent food waste.`;
  } else if (daysRemaining === 1) {
    title = `Expires Tomorrow! ⏰`;
    message = `Your ${expiryItem.productName} expires tomorrow. Plan a meal with it today!`;
  } else {
    title = `Expiring in ${daysRemaining} Days ⏳`;
    message = `Your ${expiryItem.productName} will expire in ${daysRemaining} days.`;
  }

  return sendNotification(userId, {
    title,
    message,
    type: 'EXPIRY',
    referenceId: expiryItem._id,
    data: {
      expiryItemId: String(expiryItem._id),
      productName: expiryItem.productName,
      daysRemaining: String(daysRemaining),
    },
  });
};

module.exports = {
  isFcmInitialized: () => fcmInitialized,
  sendNotification,
  sendOrderConfirmation,
  sendPaymentStatusUpdate,
  sendDeliveryStatusUpdate,
  sendPromotionalOffer,
  sendExpiryReminder,
};
