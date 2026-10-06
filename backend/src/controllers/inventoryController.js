const Inventory = require('../models/Inventory');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/response');

const getInventoryList = async (req, res) => {
  try {
    const inventory = await Inventory.find().populate('product', 'name categoryName price shelfLifeDays SKU image stockQuantity');
    return sendSuccess(res, 'Inventory list fetched', { inventory });
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

const getLowStockAlerts = async (req, res) => {
  try {
    const inventory = await Inventory.find().populate('product');
    const lowStockItems = inventory.filter((item) => item.currentQuantity <= item.minStockThreshold);
    return sendSuccess(res, 'Low stock items fetched', { lowStockItems });
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

const updateInventoryStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, action, minStockThreshold, maxStockThreshold } = req.body; // action: 'add', 'subtract', 'set'

    const inv = await Inventory.findById(id).populate('product');
    if (!inv) return sendError(res, 'Inventory record not found', {}, 404);

    let newQty = inv.currentQuantity;
    const qtyNum = Number(quantity) || 0;

    if (action === 'add') newQty += qtyNum;
    else if (action === 'subtract') newQty = Math.max(0, newQty - qtyNum);
    else if (action === 'set') newQty = Math.max(0, qtyNum);

    inv.currentQuantity = newQty;
    inv.lastRestocked = new Date();
    if (minStockThreshold !== undefined) inv.minStockThreshold = minStockThreshold;
    if (maxStockThreshold !== undefined) inv.maxStockThreshold = maxStockThreshold;

    await inv.save();

    // Update Product stockQuantity & availability
    if (inv.product) {
      const prod = await Product.findById(inv.product._id);
      if (prod) {
        prod.stockQuantity = newQty;
        prod.isAvailable = newQty > 0;
        await prod.save();
      }
    }

    // Check low stock trigger
    if (newQty <= inv.minStockThreshold) {
      const admins = await User.find({ role: 'ADMIN' });
      for (const admin of admins) {
        await Notification.create({
          user: admin._id,
          title: 'Low Stock Alert',
          message: `Product ${inv.product ? inv.product.name : inv.SKU} stock is low (${newQty} left).`,
          type: 'LOW_STOCK',
          referenceId: inv._id.toString(),
        });
      }
    }

    return sendSuccess(res, 'Inventory updated successfully', { inventory: inv });
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

module.exports = {
  getInventoryList,
  getLowStockAlerts,
  updateInventoryStock,
};
