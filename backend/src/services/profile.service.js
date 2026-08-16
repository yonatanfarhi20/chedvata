const bcrypt = require('bcrypt');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { ERROR_MESSAGES } = require('../constants/errors');
const { MIN_BCRYPT_SALT_ROUNDS } = require('../constants/auth');
const {
  parseAdminProfilePayload,
  parsePasswordChangePayload,
} = require('../validators/adminProfile');

function getAuthenticatedUserId(user) {
  const id = user?.id || user?._id;

  if (!id) {
    throw new AppError(ERROR_MESSAGES.UNAUTHORIZED, 401);
  }

  return String(id);
}

function getSaltRounds() {
  const configured = Number(process.env.BCRYPT_SALT_ROUNDS);

  if (Number.isInteger(configured) && configured >= MIN_BCRYPT_SALT_ROUNDS) {
    return configured;
  }

  return MIN_BCRYPT_SALT_ROUNDS;
}

async function getProfile(authenticatedUser) {
  const userId = getAuthenticatedUserId(authenticatedUser);
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, 404);
  }

  return user;
}

async function updateProfile(authenticatedUser, payload) {
  const userId = getAuthenticatedUserId(authenticatedUser);
  const data = parseAdminProfilePayload(payload);
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, 404);
  }

  Object.assign(user, data);
  await user.save();

  return user;
}

async function updatePassword(authenticatedUser, payload) {
  const userId = getAuthenticatedUserId(authenticatedUser);
  const { oldPassword, newPassword } = parsePasswordChangePayload(payload);
  const user = await User.findById(userId).select('+password');

  if (!user) {
    throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, 404);
  }

  const isCurrentPasswordValid = await bcrypt.compare(oldPassword, user.password);

  if (!isCurrentPasswordValid) {
    throw new AppError(ERROR_MESSAGES.INVALID_CURRENT_PASSWORD, 401, {
      errors: { oldPassword: ERROR_MESSAGES.INVALID_CURRENT_PASSWORD },
    });
  }

  const hashedPassword = await bcrypt.hash(newPassword, getSaltRounds());

  await User.updateOne({ _id: user._id }, { $set: { password: hashedPassword } });
}

module.exports = {
  getProfile,
  updateProfile,
  updatePassword,
};
