const AppError = require('../utils/AppError');
const { ERROR_MESSAGES } = require('../constants/errors');
const { MIN_PASSWORD_LENGTH } = require('../constants/auth');
const { validateField } = require('./register');

const MAX_PROFILE_IMAGE_LENGTH = 1_500_000;
const PROFILE_IMAGE_PATTERN = /^(data:image\/[a-zA-Z0-9.+-]+;base64,[a-zA-Z0-9+/=\s]+|https?:\/\/\S+)$/;

function throwIfErrors(errors) {
  if (Object.keys(errors).length > 0) {
    throw new AppError(ERROR_MESSAGES.INVALID_DATA, 400, { errors });
  }
}

function parseProfileImage(rawValue, errors) {
  if (rawValue === undefined) {
    return undefined;
  }

  if (rawValue === null) {
    return '';
  }

  const value = typeof rawValue === 'string' ? rawValue.trim() : '';

  if (!value) {
    return '';
  }

  if (value.length > MAX_PROFILE_IMAGE_LENGTH || !PROFILE_IMAGE_PATTERN.test(value)) {
    errors.profileImage = ERROR_MESSAGES.INVALID_PROFILE_IMAGE;
    return undefined;
  }

  return value;
}

function parseAdminProfilePayload(payload = {}) {
  const errors = {};
  const data = {};

  ['phone', 'address'].forEach((name) => {
    if (payload[name] === undefined) {
      return;
    }

    const message = validateField(name, payload[name]);
    if (message) {
      errors[name] = message;
      return;
    }

    data[name] = payload[name].trim();
  });

  const profileImage = parseProfileImage(payload.profileImage, errors);
  if (profileImage !== undefined) {
    data.profileImage = profileImage;
  }

  throwIfErrors(errors);

  if (Object.keys(data).length === 0) {
    throw new AppError(ERROR_MESSAGES.INVALID_DATA, 400);
  }

  return data;
}

function parsePasswordChangePayload(payload = {}) {
  const errors = {};
  const oldPassword = typeof payload.oldPassword === 'string' ? payload.oldPassword : '';
  const newPassword = typeof payload.newPassword === 'string' ? payload.newPassword.trim() : '';

  if (!oldPassword) {
    errors.oldPassword = 'שדה זה הוא חובה';
  }

  if (!newPassword) {
    errors.newPassword = 'שדה זה הוא חובה';
  } else if (newPassword.length < MIN_PASSWORD_LENGTH) {
    errors.newPassword = 'הסיסמה חייבת להכיל לפחות 8 תווים';
  }

  throwIfErrors(errors);

  return { oldPassword, newPassword };
}

module.exports = {
  parseAdminProfilePayload,
  parsePasswordChangePayload,
};
