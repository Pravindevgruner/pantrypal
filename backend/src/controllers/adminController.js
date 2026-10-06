const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const ExpiryItem = require('../models/ExpiryItem');
const Payment = require('../models/Payment');
const { sendSuccess, sendError } = require('../utils/response');

const getAdminDashboard = async (req, res) => {
  try {
    const totalCustomers = await User.countDocuments({ role: 'CUSTOMER' });
    const totalDeliveryPartners = await User.countDocuments({ role: 'DELIVERY_PARTNER' });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ orderStatus: { $in: ['PLACED', 'CONFIRMED', 'ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY'] } });
    const completedOrders = await Order.countDocuments({ orderStatus: 'DELIVERED' });
    const cancelledOrders = await Order.countDocuments({ orderStatus: 'CANCELLED' });

    // Revenue calculation
    const completedOrdersData = await Order.find({ orderStatus: 'DELIVERED' });
    const totalRevenue = completedOrdersData.reduce((acc, curr) => acc + curr.totalAmount, 0);

    // Today's stats
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayOrders = await Order.find({ createdAt: { $gte: startOfDay } });
    const todayRevenue = todayOrders
      .filter((o) => o.orderStatus === 'DELIVERED')
      .reduce((acc, curr) => acc + curr.totalAmount, 0);

    // Low stock items count
    const inventory = await Inventory.find();
    const lowStockCount = inventory.filter((item) => item.currentQuantity <= item.minStockThreshold).length;

    // Expiring products count
    const expiringCount = await ExpiryItem.countDocuments({ status: 'EXPIRING_SOON' });

    // Sales Trend (Last 7 Days)
    const salesTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      const dayOrders = await Order.find({
        createdAt: { $gte: dayStart, $lte: dayEnd },
        orderStatus: 'DELIVERED',
      });

      const dayRev = dayOrders.reduce((acc, curr) => acc + curr.totalAmount, 0);
      const dayName = dayStart.toLocaleDateString('en-US', { weekday: 'short' });

      salesTrend.push({
        day: dayName,
        date: dayStart.toISOString().split('T')[0],
        revenue: dayRev,
        orders: dayOrders.length,
      });
    }

    return sendSuccess(res, 'Admin dashboard metrics fetched', {
      metrics: {
        totalRevenue,
        totalOrders,
        todayOrders: todayOrders.length,
        todayRevenue,
        pendingOrders,
        completedOrders,
        cancelledOrders,
        totalCustomers,
        activeDeliveryPartners: totalDeliveryPartners,
        totalProducts,
        lowStockCount,
        expiringCount,
      },
      salesTrend,
    });
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

const getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const query = {};
    if (role) query.role = role;

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    return sendSuccess(res, 'Users fetched', { users });
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findById(id);
    if (!user) return sendError(res, 'User not found', {}, 404);

    user.isActive = isActive;
    await user.save();

    return sendSuccess(res, 'User status updated', { user });
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

const getReports = async (req, res) => {
  try {
    const orders = await Order.find().populate('customer', 'name email').sort({ createdAt: -1 });
    const payments = await Payment.find().populate('customer', 'name').sort({ createdAt: -1 });
    const expiryItems = await ExpiryItem.find().populate('customerId', 'name').sort({ createdAt: -1 });

    return sendSuccess(res, 'Reports data fetched', {
      ordersSummary: {
        total: orders.length,
        delivered: orders.filter((o) => o.orderStatus === 'DELIVERED').length,
        cancelled: orders.filter((o) => o.orderStatus === 'CANCELLED').length,
      },
      paymentsSummary: {
        totalTransactions: payments.length,
        successfulAmount: payments.filter((p) => p.status === 'Successful').reduce((a, c) => a + c.amount, 0),
      },
      expirySummary: {
        totalTracked: expiryItems.length,
        fresh: expiryItems.filter((e) => e.status === 'FRESH').length,
        expiringSoon: expiryItems.filter((e) => e.status === 'EXPIRING_SOON').length,
        expired: expiryItems.filter((e) => e.status === 'EXPIRED').length,
        consumed: expiryItems.filter((e) => e.status === 'CONSUMED').length,
        discarded: expiryItems.filter((e) => e.status === 'DISCARDED').length,
      },
    });
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

module.exports = {
  getAdminDashboard,
  getUsers,
  updateUserStatus,
  getReports,
};
