const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');
const { sendSuccess, sendError } = require('../utils/response');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'pantrypal_super_secret_jwt_key_2026_dev_mode', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

const register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 'Please provide name, email, and password', {}, 400);
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return sendError(res, 'User with this email already exists', {}, 400);
    }

    const user = await User.create({
      name,
      email,
      password,
      phone: phone || '',
      role: role && ['CUSTOMER', 'DELIVERY_PARTNER', 'ADMIN'].includes(role) ? role : 'CUSTOMER',
    });

    // Initialize Cart and Wishlist if Customer
    if (user.role === 'CUSTOMER') {
      await Cart.create({ user: user._id, items: [] });
      await Wishlist.create({ user: user._id, products: [] });
    }

    const token = generateToken(user._id);

    return sendSuccess(
      res,
      'User registered successfully',
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      },
      201
    );
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Please provide email and password', {}, 400);
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return sendError(res, 'Invalid credentials', {}, 401);
    }

    if (!user.isActive) {
      return sendError(res, 'Your account has been deactivated. Contact admin.', {}, 403);
    }

    const token = generateToken(user._id);

    return sendSuccess(res, 'Login successful', {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    return sendSuccess(res, 'Profile fetched', { user });
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone, profileImage, fcmToken } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (profileImage) user.profileImage = profileImage;
    if (fcmToken) user.fcmToken = fcmToken;

    await user.save();

    return sendSuccess(res, 'Profile updated successfully', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    return sendError(res, error.message, {}, 500);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
};
