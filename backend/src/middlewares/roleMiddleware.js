const AppError = require('../utils/AppError');
const { ERROR_MESSAGES } = require('../constants/errors');

function roleMiddleware(allowedRoles) {
  if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) {
    throw new Error('roleMiddleware requires a non-empty array of allowed roles');
  }

  const allowed = new Set(allowedRoles);

  return (req, _res, next) => {
    if (!req.user) {
      return next(new AppError(ERROR_MESSAGES.UNAUTHORIZED, 401));
    }

    if (!allowed.has(req.user.role)) {
      return next(new AppError(ERROR_MESSAGES.FORBIDDEN, 403));
    }

    return next();
  };
}

module.exports = roleMiddleware;
