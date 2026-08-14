const AppError = require('../utils/AppError');
const { ERROR_MESSAGES } = require('../constants/errors');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseLoginPayload(payload = {}) {
  const errors = {};
  const email = typeof payload.email === 'string' ? payload.email.trim() : '';
  const password = typeof payload.password === 'string' ? payload.password.trim() : '';

  if (!email) {
    errors.email = 'שדה זה הוא חובה';
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = 'כתובת דואר אלקטרוני לא תקינה';
  }

  if (!password) {
    errors.password = 'שדה זה הוא חובה';
  }

  if (Object.keys(errors).length > 0) {
    throw new AppError(ERROR_MESSAGES.INVALID_DATA, 400, { errors });
  }

  return {
    email: email.toLowerCase(),
    password,
  };
}

module.exports = {
  parseLoginPayload,
};
