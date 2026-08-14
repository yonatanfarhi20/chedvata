const AppError = require('../utils/AppError');
const { ERROR_MESSAGES } = require('../constants/errors');

const MIN_PASSWORD_LENGTH = 8;

function parseResetPasswordPayload(payload = {}) {
  const errors = {};
  const password = typeof payload.password === 'string' ? payload.password.trim() : '';

  if (!password) {
    errors.password = 'שדה זה הוא חובה';
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = 'הסיסמה חייבת להכיל לפחות 8 תווים';
  }

  if (Object.keys(errors).length > 0) {
    throw new AppError(ERROR_MESSAGES.INVALID_DATA, 400, { errors });
  }

  return { password };
}

module.exports = {
  parseResetPasswordPayload,
};
