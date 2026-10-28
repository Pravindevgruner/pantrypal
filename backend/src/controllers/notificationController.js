const Notification = require('../models/Notification');
const User = require('../models/User');
const Order = require('../models/Order');
const ExpiryItem = require('../models/ExpiryItem');
const {
  isFcmInitialized,
  sendNotification,
  sendOrderConfirmation,
  sendPaymentStatusUpdate,
  sendDeliveryStatusUpdate,
  sendPromotionalOffer,
  sendExpiryReminder,
} = require('../services/fcmService');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Fetch all notifications for the authenticated user
 */
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return sendSuccess(res, 'Notifications fetched successfully', {
      notifications,
      unreadCount,
      fcmActive: isFcmInitialized(),
    });
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

/**
 * Mark a single notification as read
 */
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOne({ _id: id, user: req.user._id });
    if (!notification) return sendError(res, 'Notification not found', {}, 404);

    notification.isRead = true;
    await notification.save();

    return sendSuccess(res, 'Marked as read', { notification });
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

/**
 * Mark all user notifications as read
 */
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    return sendSuccess(res, 'All notifications marked as read');
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

/**
 * Register / Update FCM Device Push Token
 */
const updateFcmToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return sendError(res, 'FCM token is required', {}, 400);

    const user = await User.findById(req.user._id);
    if (!user) return sendError(res, 'User not found', {}, 404);

    user.fcmToken = token;
    await user.save();

    return sendSuccess(res, 'FCM device token registered successfully', {
      userId: user._id,
      fcmTokenConfigured: true,
    });
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

/**
 * Test Trigger for Any of the 5 Notification Types
 */
const triggerTestNotification = async (req, res) => {
  try {
    const { type = 'ORDER' } = req.body;
    const userId = req.user._id;

    let result;

    switch (type.toUpperCase()) {
      case 'ORDER': {
        const dummyOrder = {
          _id: req.user._id,
          orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
          totalAmount: 349,
        };
        result = await sendOrderConfirmation(userId, dummyOrder);
        break;
      }
      case 'PAYMENT': {
        const dummyOrder = {
          _id: req.user._id,
          orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
        };
        result = await sendPaymentStatusUpdate(userId, dummyOrder, 'Razorpay UPI (₹1 Penny Test)');
        break;
      }
      case 'DELIVERY': {
        const dummyOrder = {
          _id: req.user._id,
          orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
        };
        result = await sendDeliveryStatusUpdate(userId, dummyOrder, 'OUT_FOR_DELIVERY');
        break;
      }
      case 'PROMO': {
        result = await sendPromotionalOffer(userId, {
          title: '🎉 25% Off Fresh Dairy & Greens!',
          message: 'Flash Deal: Use coupon PANTRY25 at checkout to enjoy 25% discount today!',
          promoCode: 'PANTRY25',
          discount: 25,
        });
        break;
      }
      case 'EXPIRY': {
        const dummyItem = {
          _id: req.user._id,
          productName: 'Organic Greek Yogurt',
        };
        result = await sendExpiryReminder(userId, dummyItem, 2);
        break;
      }
      default: {
        return sendError(res, `Unknown notification type: ${type}`, {}, 400);
      }
    }

    return sendSuccess(res, `Test ${type} notification triggered successfully`, {
      result,
      fcmActive: isFcmInitialized(),
    });
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

/**
 * Admin Promotional Offers & Discounts Broadcaster
 */
const broadcastPromotion = async (req, res) => {
  try {
    const { title, message, promoCode = 'SAVE20', discount = 20 } = req.body;
    const result = await sendPromotionalOffer('ALL', { title, message, promoCode, discount });

    return sendSuccess(res, 'Promotional offer broadcasted to all active customers', result);
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  updateFcmToken,
  triggerTestNotification,
  broadcastPromotion,
};
