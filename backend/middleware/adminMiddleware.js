const { ApiError } = require('./errorHandler');

const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    next(new ApiError(403, 'Admin access is required for this action'));
  } else {
    next();
  }
};

module.exports = adminMiddleware;
