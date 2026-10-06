const { sendError } = require('../utils/response');

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Not authenticated', {}, 401);
    }
    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        `Access forbidden: User role '${req.user.role}' is not authorized to access this route`,
        {},
        403
      );
    }
    next();
  };
};

module.exports = { authorize };
