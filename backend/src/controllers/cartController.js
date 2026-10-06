const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { sendSuccess, sendError } = require('../utils/response');

const recalculateCart = (cart) => {
  let subtotal = 0;
  cart.items.forEach((item) => {
    subtotal += item.quantity * item.unitPrice;
  });

  const discount = subtotal > 500 ? 50 : 0;
  const deliveryFee = subtotal > 300 || subtotal === 0 ? 0 : 30;
  const totalAmount = Math.max(0, subtotal - discount + deliveryFee);

  cart.subtotal = subtotal;
  cart.discount = discount;
  cart.deliveryFee = deliveryFee;
  cart.totalAmount = totalAmount;
  return cart;
};

const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name image price discountPrice stockQuantity unit weight SKU shelfLifeDays isAvailable');

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    recalculateCart(cart);
    await cart.save();

    return sendSuccess(res, 'Cart fetched successfully', { cart });
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return sendError(res, 'Product not found or unavailable', {}, 404);
    }

    if (product.stockQuantity < quantity) {
      return sendError(res, `Only ${product.stockQuantity} items available in stock`, {}, 400);
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const priceToUse = product.discountPrice > 0 ? product.discountPrice : product.price;
    const existingIndex = cart.items.findIndex((item) => item.product.toString() === productId);

    if (existingIndex > -1) {
      const newQty = cart.items[existingIndex].quantity + Number(quantity);
      if (product.stockQuantity < newQty) {
        return sendError(res, `Cannot add more. Stock limit of ${product.stockQuantity} reached.`, {}, 400);
      }
      cart.items[existingIndex].quantity = newQty;
      cart.items[existingIndex].unitPrice = priceToUse;
    } else {
      cart.items.push({
        product: productId,
        quantity: Number(quantity),
        unitPrice: priceToUse,
      });
    }

    recalculateCart(cart);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('items.product');
    return sendSuccess(res, 'Item added to cart', { cart: populatedCart });
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

const updateCartItemQuantity = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return sendError(res, 'Cart not found', {}, 404);

    const itemIndex = cart.items.findIndex((i) => i._id.toString() === itemId);
    if (itemIndex === -1) return sendError(res, 'Item not found in cart', {}, 404);

    const targetItem = cart.items[itemIndex];
    const product = await Product.findById(targetItem.product);

    const newQty = Number(quantity);
    if (newQty <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      if (product && product.stockQuantity < newQty) {
        return sendError(res, `Only ${product.stockQuantity} items in stock`, {}, 400);
      }
      cart.items[itemIndex].quantity = newQty;
    }

    recalculateCart(cart);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('items.product');
    return sendSuccess(res, 'Cart updated', { cart: populatedCart });
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return sendError(res, 'Cart not found', {}, 404);

    cart.items = cart.items.filter((i) => i._id.toString() !== itemId);
    recalculateCart(cart);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('items.product');
    return sendSuccess(res, 'Item removed from cart', { cart: populatedCart });
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      recalculateCart(cart);
      await cart.save();
    }
    return sendSuccess(res, 'Cart cleared', { cart });
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
};
