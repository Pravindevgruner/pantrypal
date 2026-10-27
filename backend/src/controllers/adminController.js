const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const ExpiryItem = require('../models/ExpiryItem');
const Payment = require('../models/Payment');
const { runExpiryMonitoring } = require('../services/expiryEngineService');
const { getExpiryStatus } = require('../utils/expiryCalculator');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Real-Time Admin Dashboard Metrics, Analytics, Pipelines & Feeds
 */
const getAdminDashboard = async (req, res) => {
  try {
    const totalCustomers = await User.countDocuments({ role: 'CUSTOMER' });
    const activeCustomers = await User.countDocuments({ role: 'CUSTOMER', isActive: true });
    const totalDeliveryPartners = await User.countDocuments({ role: 'DELIVERY_PARTNER' });
    const activeDeliveryPartners = await User.countDocuments({ role: 'DELIVERY_PARTNER', isActive: true });
    const totalAdmins = await User.countDocuments({ role: 'ADMIN' });
    const totalProducts = await Product.countDocuments();

    // Order status pipeline counts
    const totalOrders = await Order.countDocuments();
    const placedCount = await Order.countDocuments({ orderStatus: 'PLACED' });
    const confirmedCount = await Order.countDocuments({ orderStatus: 'CONFIRMED' });
    const assignedCount = await Order.countDocuments({ orderStatus: 'ASSIGNED' });
    const pickedUpCount = await Order.countDocuments({ orderStatus: 'PICKED_UP' });
    const outForDeliveryCount = await Order.countDocuments({ orderStatus: 'OUT_FOR_DELIVERY' });
    const completedOrders = await Order.countDocuments({ orderStatus: 'DELIVERED' });
    const cancelledOrders = await Order.countDocuments({ orderStatus: 'CANCELLED' });
    const pendingOrders = placedCount + confirmedCount + assignedCount + pickedUpCount + outForDeliveryCount;

    // Revenue calculations
    const completedOrdersData = await Order.find({ orderStatus: 'DELIVERED' });
    const totalRevenue = completedOrdersData.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
    const avgOrderValue = completedOrders > 0 ? Math.round(totalRevenue / completedOrders) : 0;

    // Today & Yesterday comparison
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    const todayOrdersList = await Order.find({ createdAt: { $gte: startOfToday } });
    const todayOrders = todayOrdersList.length;
    const todayRevenue = todayOrdersList
      .filter((o) => o.orderStatus === 'DELIVERED')
      .reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

    const yesterdayOrdersList = await Order.find({
      createdAt: { $gte: startOfYesterday, $lt: startOfToday },
    });
    const yesterdayRevenue = yesterdayOrdersList
      .filter((o) => o.orderStatus === 'DELIVERED')
      .reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

    // Warehouse Inventory metrics
    const inventory = await Inventory.find().populate('product', 'name price');
    const lowStockItems = inventory.filter((item) => item.currentQuantity <= item.minStockThreshold);
    const lowStockCount = lowStockItems.length;
    const outOfStockCount = inventory.filter((item) => item.currentQuantity === 0).length;
    const totalInventoryUnits = inventory.reduce((acc, curr) => acc + (curr.currentQuantity || 0), 0);

    // Smart Expiry Metrics across households
    const allExpiryItems = await ExpiryItem.find();
    const freshCount = allExpiryItems.filter((e) => e.status === 'FRESH').length;
    const expiringCount = allExpiryItems.filter((e) => e.status === 'EXPIRING_SOON').length;
    const expiredCount = allExpiryItems.filter((e) => e.status === 'EXPIRED').length;
    const consumedCount = allExpiryItems.filter((e) => e.status === 'CONSUMED').length;
    const discardedCount = allExpiryItems.filter((e) => e.status === 'DISCARDED').length;
    const totalTrackedExpiry = allExpiryItems.length;
    const wastagePreventionRate = (consumedCount + discardedCount) > 0
      ? Math.round((consumedCount / (consumedCount + discardedCount)) * 100)
      : 100;

    // Sales Trend (Last 7 Days)
    const salesTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      const dayOrders = await Order.find({
        createdAt: { $gte: dayStart, $lte: dayEnd },
      });

      const dayDelivered = dayOrders.filter((o) => o.orderStatus === 'DELIVERED');
      const dayRev = dayDelivered.reduce((acc, curr) => acc + curr.totalAmount, 0);
      const dayName = dayStart.toLocaleDateString('en-US', { weekday: 'short' });

      salesTrend.push({
        day: dayName,
        date: dayStart.toISOString().split('T')[0],
        revenue: dayRev,
        orders: dayOrders.length,
        delivered: dayDelivered.length,
      });
    }

    // Top 10 Recent Orders for Live Real-Time Feed
    const recentOrders = await Order.find()
      .populate('customer', 'name email phone')
      .populate('deliveryPartner', 'name phone')
      .sort({ createdAt: -1 })
      .limit(10);

    // Dynamic Live Real-Time Activity Feed
    const activities = [];

    // Order activities
    for (const order of recentOrders.slice(0, 6)) {
      activities.push({
        id: `ord-${order._id}`,
        type: order.orderStatus === 'DELIVERED' ? 'DELIVERY_SUCCESS' : order.orderStatus === 'CANCELLED' ? 'ORDER_CANCELLED' : 'ORDER_STATUS',
        title: `Order #${order.orderNumber} - ${order.orderStatus}`,
        description: `${order.customer?.name || 'Customer'} • ₹${order.totalAmount} via ${order.paymentMethod}`,
        timestamp: order.updatedAt || order.createdAt,
        badge: order.orderStatus,
      });
    }

    // Expiry alerts activity
    const recentExpiring = await ExpiryItem.find({ status: 'EXPIRING_SOON' })
      .populate('customerId', 'name')
      .sort({ updatedAt: -1 })
      .limit(3);

    for (const exp of recentExpiring) {
      activities.push({
        id: `exp-${exp._id}`,
        type: 'EXPIRY_ALERT',
        title: `Smart Expiry Alert: ${exp.productName}`,
        description: `Expiring soon in ${exp.customerId?.name || 'Customer'}'s pantry`,
        timestamp: exp.updatedAt || exp.createdAt,
        badge: 'EXPIRING_SOON',
      });
    }

    // Low stock alerts activity
    for (const item of lowStockItems.slice(0, 3)) {
      activities.push({
        id: `low-${item._id}`,
        type: 'LOW_STOCK',
        title: `Low Stock: ${item.product?.name || item.SKU}`,
        description: `Only ${item.currentQuantity} ${item.unit} remaining (Threshold: ${item.minStockThreshold})`,
        timestamp: item.updatedAt || item.createdAt,
        badge: 'LOW_STOCK',
      });
    }

    // Sort activities by timestamp descending
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return sendSuccess(res, 'Admin dashboard live metrics fetched', {
      metrics: {
        totalRevenue,
        todayRevenue,
        yesterdayRevenue,
        avgOrderValue,
        totalOrders,
        todayOrders,
        pendingOrders,
        completedOrders,
        cancelledOrders,
        totalCustomers,
        activeCustomers,
        totalDeliveryPartners,
        activeDeliveryPartners,
        totalAdmins,
        totalProducts,
        lowStockCount,
        outOfStockCount,
        totalInventoryUnits,
        totalTrackedExpiry,
        freshCount,
        expiringCount,
        expiredCount,
        consumedCount,
        discardedCount,
        wastagePreventionRate,
      },
      pipeline: {
        PLACED: placedCount,
        CONFIRMED: confirmedCount,
        ASSIGNED: assignedCount,
        PICKED_UP: pickedUpCount,
        OUT_FOR_DELIVERY: outForDeliveryCount,
        DELIVERED: completedOrders,
        CANCELLED: cancelledOrders,
      },
      salesTrend,
      recentOrders,
      recentActivities: activities.slice(0, 12),
      serverTime: new Date().toISOString(),
    });
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

/**
 * Users Management
 */
const getUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });

    // Attach order counts for each user
    const usersWithStats = await Promise.all(
      users.map(async (u) => {
        const userObj = u.toObject();
        if (u.role === 'CUSTOMER') {
          userObj.orderCount = await Order.countDocuments({ customer: u._id });
        } else if (u.role === 'DELIVERY_PARTNER') {
          userObj.deliveriesCompleted = await Order.countDocuments({ deliveryPartner: u._id, orderStatus: 'DELIVERED' });
          userObj.activeDeliveries = await Order.countDocuments({
            deliveryPartner: u._id,
            orderStatus: { $in: ['ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY'] },
          });
        }
        return userObj;
      })
    );

    return sendSuccess(res, 'Users fetched', { users: usersWithStats });
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

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['CUSTOMER', 'DELIVERY_PARTNER', 'ADMIN'].includes(role)) {
      return sendError(res, 'Invalid role specified', {}, 400);
    }

    const user = await User.findById(id);
    if (!user) return sendError(res, 'User not found', {}, 404);

    user.role = role;
    await user.save();

    return sendSuccess(res, 'User role updated', { user });
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

const createDeliveryPartner = async (req, res) => {
  try {
    const { name, email, password, phone, profileImage } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 'Name, email, and password are required', {}, 400);
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return sendError(res, 'User with this email already exists', {}, 400);
    }

    const partner = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || '',
      role: 'DELIVERY_PARTNER',
      profileImage: profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      isActive: true,
    });

    return sendSuccess(res, 'Delivery Partner created successfully', {
      user: {
        _id: partner._id,
        name: partner.name,
        email: partner.email,
        phone: partner.phone,
        role: partner.role,
        isActive: partner.isActive,
      },
    }, 201);
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) return sendError(res, 'User not found', {}, 404);

    return sendSuccess(res, 'User deleted successfully', { userId: id });
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

/**
 * System-Wide Smart Expiry Control & Monitoring
 */
const getAllExpiryItems = async (req, res) => {
  try {
    const { status, search } = req.query;
    const query = {};
    if (status && status !== 'ALL') query.status = status;
    if (search) query.productName = { $regex: search, $options: 'i' };

    const items = await ExpiryItem.find(query)
      .populate('customerId', 'name email phone')
      .populate('productId', 'categoryName')
      .sort({ expiryDate: 1 });

    const summary = {
      fresh: await ExpiryItem.countDocuments({ status: 'FRESH' }),
      expiringSoon: await ExpiryItem.countDocuments({ status: 'EXPIRING_SOON' }),
      expired: await ExpiryItem.countDocuments({ status: 'EXPIRED' }),
      consumed: await ExpiryItem.countDocuments({ status: 'CONSUMED' }),
      discarded: await ExpiryItem.countDocuments({ status: 'DISCARDED' }),
      total: await ExpiryItem.countDocuments(),
    };

    return sendSuccess(res, 'All platform expiry records fetched', { items, summary });
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

const triggerManualExpiryScan = async (req, res) => {
  try {
    const result = await runExpiryMonitoring();
    const updatedSummary = {
      fresh: await ExpiryItem.countDocuments({ status: 'FRESH' }),
      expiringSoon: await ExpiryItem.countDocuments({ status: 'EXPIRING_SOON' }),
      expired: await ExpiryItem.countDocuments({ status: 'EXPIRED' }),
    };

    return sendSuccess(res, 'Smart Expiry monitoring cycle completed in real time', {
      scanResult: result,
      summary: updatedSummary,
    });
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

/**
 * Warehouse Bulk Stock Replenishment
 */
const bulkRestockLowStock = async (req, res) => {
  try {
    const { restockQuantity = 50 } = req.body;
    const inventory = await Inventory.find();
    let restockedCount = 0;

    for (const inv of inventory) {
      if (inv.currentQuantity <= inv.minStockThreshold) {
        inv.currentQuantity += Number(restockQuantity);
        inv.lastRestocked = new Date();
        await inv.save();

        await Product.findByIdAndUpdate(inv.product, {
          $set: { stockQuantity: inv.currentQuantity, isAvailable: true },
        });
        restockedCount++;
      }
    }

    return sendSuccess(res, `Bulk restock completed: replenished ${restockedCount} low-stock items`, {
      restockedCount,
    });
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

/**
 * Live Order Simulator (Instant Real-Time Testing & Verification)
 */
const simulateTestOrder = async (req, res) => {
  try {
    let customer = await User.findOne({ role: 'CUSTOMER' });
    if (!customer) {
      customer = await User.create({
        name: 'Demo Live Customer',
        email: `demo_${Date.now()}@pantrypal.com`,
        password: 'password123',
        phone: '+91 98765 43210',
        role: 'CUSTOMER',
      });
    }

    const products = await Product.find({ isAvailable: true }).limit(2);
    if (products.length === 0) {
      return sendError(res, 'No available products found to simulate order', {}, 400);
    }

    const items = products.map((p) => ({
      product: p._id,
      productName: p.name,
      productImage: p.image,
      quantity: 1,
      unitPrice: p.price,
      shelfLifeDays: p.shelfLifeDays || 7,
    }));

    const subtotal = items.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0);
    const deliveryFee = 25;
    const totalAmount = subtotal + deliveryFee;
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;

    const order = await Order.create({
      orderNumber,
      customer: customer._id,
      items,
      address: {
        fullName: customer.name,
        phone: customer.phone,
        houseFlat: 'Flat 402, Green Valley',
        street: 'MG Road',
        area: 'Indiranagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560038',
        latitude: 12.9716,
        longitude: 77.5946,
      },
      subtotal,
      deliveryFee,
      totalAmount,
      paymentMethod: 'COD',
      paymentStatus: 'PENDING',
      orderStatus: 'PLACED',
      timeline: [{ status: 'PLACED', note: 'Simulated live test order from Admin Panel' }],
    });

    // Create Expiry tracking records for items
    for (const item of items) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + (item.shelfLifeDays || 7));
      await ExpiryItem.create({
        customerId: customer._id,
        productId: item.product,
        orderId: order._id,
        productName: item.productName,
        productImage: item.productImage,
        quantity: item.quantity,
        shelfLifeDays: item.shelfLifeDays || 7,
        purchaseDate: new Date(),
        expiryDate,
        status: 'FRESH',
      });
    }

    // Decrement stock in inventory
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stockQuantity: -item.quantity } });
      await Inventory.findOneAndUpdate({ product: item.product }, { $inc: { currentQuantity: -item.quantity } });
    }

    return sendSuccess(res, `Live order #${orderNumber} created successfully!`, { order }, 201);
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

/**
 * Platform Reports & Analytics
 */
const getReports = async (req, res) => {
  try {
    const orders = await Order.find().populate('customer', 'name email').sort({ createdAt: -1 });
    const payments = await Payment.find().populate('customer', 'name').sort({ createdAt: -1 });
    const expiryItems = await ExpiryItem.find().populate('customerId', 'name').sort({ createdAt: -1 });

    const totalOrders = orders.length;
    const delivered = orders.filter((o) => o.orderStatus === 'DELIVERED').length;
    const cancelled = orders.filter((o) => o.orderStatus === 'CANCELLED').length;
    const active = orders.filter((o) => ['PLACED', 'CONFIRMED', 'ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(o.orderStatus)).length;
    const totalRev = orders.filter((o) => o.orderStatus === 'DELIVERED').reduce((a, c) => a + c.totalAmount, 0);

    return sendSuccess(res, 'Reports data fetched', {
      ordersSummary: {
        total: totalOrders,
        delivered,
        cancelled,
        active,
        totalRevenue: totalRev,
        fulfillmentRate: totalOrders > 0 ? Math.round((delivered / totalOrders) * 100) : 0,
      },
      paymentsSummary: {
        totalTransactions: payments.length,
        successfulAmount: payments.filter((p) => p.status === 'Successful').reduce((a, c) => a + c.amount, 0),
        pendingAmount: orders.filter((o) => o.paymentStatus === 'PENDING').reduce((a, c) => a + c.totalAmount, 0),
      },
      expirySummary: {
        totalTracked: expiryItems.length,
        fresh: expiryItems.filter((e) => e.status === 'FRESH').length,
        expiringSoon: expiryItems.filter((e) => e.status === 'EXPIRING_SOON').length,
        expired: expiryItems.filter((e) => e.status === 'EXPIRED').length,
        consumed: expiryItems.filter((e) => e.status === 'CONSUMED').length,
        discarded: expiryItems.filter((e) => e.status === 'DISCARDED').length,
        preventionRate: expiryItems.filter((e) => ['CONSUMED', 'DISCARDED'].includes(e.status)).length > 0
          ? Math.round(
              (expiryItems.filter((e) => e.status === 'CONSUMED').length /
                expiryItems.filter((e) => ['CONSUMED', 'DISCARDED'].includes(e.status)).length) *
                100
            )
          : 100,
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
  updateUserRole,
  createDeliveryPartner,
  deleteUser,
  getAllExpiryItems,
  triggerManualExpiryScan,
  bulkRestockLowStock,
  simulateTestOrder,
  getReports,
};
