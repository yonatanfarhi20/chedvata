const AppError = require('../utils/AppError');
const { ERROR_MESSAGES } = require('../constants/errors');

function notFound(_req, _res, next) {
  next(new AppError(ERROR_MESSAGES.NOT_FOUND, 404));
}

module.exports = notFound;
