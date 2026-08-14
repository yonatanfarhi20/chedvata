const AppError = require('../utils/AppError');
const { ERROR_MESSAGES } = require('../constants/errors');

function errorHandler(err, _req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ message: ERROR_MESSAGES.INVALID_JSON });
  }

  if (err.name === 'ValidationError') {
    const errors = Object.fromEntries(
      Object.entries(err.errors).map(([field, error]) => [field, error.message]),
    );
    return res.status(400).json({
      message: ERROR_MESSAGES.INVALID_DATA,
      errors,
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({ message: ERROR_MESSAGES.DUPLICATE_USER });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
      ...err.details,
    });
  }

  console.error(err);
  return res.status(500).json({ message: ERROR_MESSAGES.INTERNAL });
}

module.exports = errorHandler;
