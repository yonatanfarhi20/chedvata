const AppError = require('../utils/AppError');
const { ERROR_MESSAGES } = require('../constants/errors');

function isProduction() {
  return process.env.NODE_ENV === 'production';
}

function resolveStatusCode(err) {
  const statusCode = Number(err.statusCode || err.status);
  return Number.isInteger(statusCode) && statusCode >= 400 ? statusCode : 500;
}

function buildErrorBody(err, statusCode, message, extra = {}) {
  const body = {
    ...extra,
    success: false,
    statusCode,
    message,
  };

  if (!isProduction() && err.stack) {
    body.stack = err.stack;
  }

  return body;
}

function sendError(res, err, statusCode, message, extra = {}) {
  return res.status(statusCode).json(buildErrorBody(err, statusCode, message, extra));
}

function errorHandler(err, _req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return sendError(res, err, 400, ERROR_MESSAGES.INVALID_JSON);
  }

  if (err.name === 'ValidationError') {
    const errors = Object.fromEntries(
      Object.entries(err.errors).map(([field, error]) => [field, error.message]),
    );

    return sendError(res, err, 400, ERROR_MESSAGES.INVALID_DATA, { errors });
  }

  if (err.code === 11000) {
    const duplicateFields = Object.keys(err.keyPattern || err.keyValue || {});
    const errors = {};

    if (duplicateFields.includes('email')) {
      errors.email = ERROR_MESSAGES.DUPLICATE_USER;
    }

    if (duplicateFields.includes('idNumber')) {
      errors.idNumber = ERROR_MESSAGES.DUPLICATE_USER;
    }

    return sendError(res, err, 409, ERROR_MESSAGES.DUPLICATE_USER, {
      ...(Object.keys(errors).length > 0 ? { errors } : {}),
    });
  }

  if (err instanceof AppError) {
    return sendError(res, err, resolveStatusCode(err), err.message, err.details);
  }

  console.error(err);

  const statusCode = resolveStatusCode(err);
  const message = isProduction()
    ? ERROR_MESSAGES.INTERNAL
    : err.message || ERROR_MESSAGES.INTERNAL;

  return sendError(res, err, statusCode, message);
}

module.exports = errorHandler;
