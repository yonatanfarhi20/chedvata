const User = require('../models/User');
const AppError = require('../utils/AppError');
const { ERROR_MESSAGES } = require('../constants/errors');
const { USER_STATUS } = require('../constants/user');
const { verifyJwt } = require('../services/jwt.service');

function getBearerToken(req) {
  const header = req.headers.authorization;

  if (!header || typeof header !== 'string') {
    return null;
  }

  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token;
}

async function authMiddleware(req, _res, next) {
  const token = getBearerToken(req);

  if (!token) {
    throw new AppError(ERROR_MESSAGES.UNAUTHORIZED, 401);
  }

  let payload;

  try {
    payload = verifyJwt(token);
  } catch {
    throw new AppError(ERROR_MESSAGES.UNAUTHORIZED, 401);
  }

  if (!payload || !payload.id) {
    throw new AppError(ERROR_MESSAGES.UNAUTHORIZED, 401);
  }

  const user = await User.findById(payload.id);

  if (!user || user.status !== USER_STATUS.ACTIVE) {
    throw new AppError(ERROR_MESSAGES.UNAUTHORIZED, 401);
  }

  req.user = user;
  next();
}

module.exports = authMiddleware;
