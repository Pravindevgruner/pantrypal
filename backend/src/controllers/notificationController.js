const Notification = require('../models/Notification');
const { sendSuccess, sendError } = require('../utils/response');

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    return sendSuccess(res, 'Notifications fetched', { notifications, unreadCount });
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

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

const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    return sendSuccess(res, 'All notifications marked as read');
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};
