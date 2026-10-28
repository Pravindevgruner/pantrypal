const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/response');

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('[Security Fatal] JWT_SECRET environment variable is missing in production!');
    }
    return 'pantrypal_super_secret_jwt_key_2026_dev_mode';
  }
  return secret;
};

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, getJwtSecret());
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user || !req.user.isActive) {
        return sendError(res, 'User is inactive or no longer exists', {}, 401);
      }
      return next();
    } catch (error) {
      return sendError(res, 'Not authorized, token failed', { error: error.message }, 401);
    }
  }

  if (!token) {
    return sendError(res, 'Not authorized, no token provided', {}, 401);
  }
};

module.exports = { protect, getJwtSecret };
