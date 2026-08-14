const mongoose = require('mongoose');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { ERROR_MESSAGES } = require('../constants/errors');
const { USER_STATUS } = require('../constants/user');

function parseUserId(rawId) {
  const id = typeof rawId === 'string' ? rawId.trim() : '';

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(ERROR_MESSAGES.PENDING_USER_NOT_FOUND, 404);
  }

  return id;
}

async function listPendingUsers() {
  return User.find({ status: USER_STATUS.PENDING_ADMIN_APPROVAL }).sort({
    createdAt: 1,
  });
}

async function approveUser(rawId) {
  const id = parseUserId(rawId);

  const user = await User.findOneAndUpdate(
    {
      _id: id,
      status: USER_STATUS.PENDING_ADMIN_APPROVAL,
    },
    {
      $set: { status: USER_STATUS.ACTIVE },
    },
    { new: true },
  );

  if (!user) {
    throw new AppError(ERROR_MESSAGES.PENDING_USER_NOT_FOUND, 404);
  }

  return user;
}

async function rejectUser(rawId) {
  const id = parseUserId(rawId);

  const user = await User.findOneAndDelete({
    _id: id,
    status: USER_STATUS.PENDING_ADMIN_APPROVAL,
  });

  if (!user) {
    throw new AppError(ERROR_MESSAGES.PENDING_USER_NOT_FOUND, 404);
  }

  return user;
}

module.exports = {
  listPendingUsers,
  approveUser,
  rejectUser,
};
