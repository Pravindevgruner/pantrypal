const Wishlist = require('../models/Wishlist');
const { sendSuccess, sendError } = require('../utils/response');

const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products', 'name image price discountPrice isAvailable categoryName shelfLifeDays');
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }
    return sendSuccess(res, 'Wishlist fetched', { wishlist });
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    if (!wishlist.products.includes(productId)) {
      wishlist.products.push(productId);
      await wishlist.save();
    }

    const populated = await Wishlist.findById(wishlist._id).populate('products');
    return sendSuccess(res, 'Added to wishlist', { wishlist: populated });
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (wishlist) {
      wishlist.products = wishlist.products.filter((p) => p.toString() !== productId);
      await wishlist.save();
    }
    const populated = await Wishlist.findById(wishlist._id).populate('products');
    return sendSuccess(res, 'Removed from wishlist', { wishlist: populated });
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
