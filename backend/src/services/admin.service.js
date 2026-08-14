const mongoose = require('mongoose');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { ERROR_MESSAGES } = require('../constants/errors');
const { USER_STATUS } = require('../constants/user');
const { sendEmail } = require('./email.service');
const { getClientOrigin } = require('../config/app');
const { buildAccountApprovedEmail } = require('../templates/emails/accountApproved');
const { buildAccountRejectedEmail } = require('../templates/emails/accountRejected');

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

  try {
    await sendEmail({
      to: user.email,
      ...buildAccountApprovedEmail({
        firstName: user.firstName,
        loginUrl: `${getClientOrigin()}/login`,
      }),
    });
  } catch (error) {
    await User.findByIdAndUpdate(user._id, {
      $set: { status: USER_STATUS.PENDING_ADMIN_APPROVAL },
    });
    console.error(error);
    throw new AppError(ERROR_MESSAGES.EMAIL_SEND_FAILED, 500);
  }

  return user;
}

async function rejectUser(rawId) {
  const id = parseUserId(rawId);

  const user = await User.findOne({
    _id: id,
    status: USER_STATUS.PENDING_ADMIN_APPROVAL,
  });

  if (!user) {
    throw new AppError(ERROR_MESSAGES.PENDING_USER_NOT_FOUND, 404);
  }

  try {
    await sendEmail({
      to: user.email,
      ...buildAccountRejectedEmail({
        firstName: user.firstName,
      }),
    });
  } catch (error) {
    console.error(error);
    throw new AppError(ERROR_MESSAGES.EMAIL_SEND_FAILED, 500);
  }

  const deletedUser = await User.findOneAndDelete({
    _id: id,
    status: USER_STATUS.PENDING_ADMIN_APPROVAL,
  });

  if (!deletedUser) {
    throw new AppError(ERROR_MESSAGES.PENDING_USER_NOT_FOUND, 404);
  }

  return deletedUser;
}

module.exports = {
  listPendingUsers,
  approveUser,
  rejectUser,
};
