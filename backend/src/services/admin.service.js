const mongoose = require('mongoose');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { ERROR_MESSAGES } = require('../constants/errors');
const { USER_ROLE, USER_STATUS } = require('../constants/user');
const { sendEmail } = require('./email.service');
const { getClientOrigin } = require('../config/app');
const { buildAccountApprovedEmail } = require('../templates/emails/accountApproved');
const { buildAccountRejectedEmail } = require('../templates/emails/accountRejected');
const {
  parseAdminCreateUserPayload,
  parseAdminUpdateUserPayload,
} = require('../validators/adminUser');
const { escapeRegex } = require('../utils/regex');

const STUDENT_SEARCH_LIMIT = 20;
const STUDENT_SEARCH_MAX_LENGTH = 100;

function studentNotFoundError() {
  return new AppError(ERROR_MESSAGES.STUDENT_NOT_IN_SYSTEM, 404, {
    error: ERROR_MESSAGES.STUDENT_NOT_IN_SYSTEM,
  });
}

function parseUserId(rawId, notFoundMessage = ERROR_MESSAGES.USER_NOT_FOUND) {
  const id = typeof rawId === 'string' ? rawId.trim() : '';

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(notFoundMessage, 404);
  }

  return id;
}

async function assertUniqueUserFields({ email, idNumber, excludeId } = {}) {
  const clauses = [];

  if (email) {
    clauses.push({ email });
  }

  if (idNumber) {
    clauses.push({ idNumber });
  }

  if (clauses.length === 0) {
    return;
  }

  const query = { $or: clauses };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const existingUsers = await User.find(query).select('email idNumber');

  if (existingUsers.length === 0) {
    return;
  }

  const errors = {};

  existingUsers.forEach((user) => {
    if (email && user.email === email) {
      errors.email = ERROR_MESSAGES.DUPLICATE_EMAIL;
    }

    if (idNumber && user.idNumber === idNumber) {
      errors.idNumber = ERROR_MESSAGES.DUPLICATE_ID_NUMBER;
    }
  });

  throw new AppError(ERROR_MESSAGES.DUPLICATE_USER, 409, { errors });
}

async function listPendingUsers() {
  return User.find({ status: USER_STATUS.PENDING_ADMIN_APPROVAL }).sort({
    createdAt: 1,
  });
}

async function approveUser(rawId) {
  const id = parseUserId(rawId, ERROR_MESSAGES.PENDING_USER_NOT_FOUND);

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
  const id = parseUserId(rawId, ERROR_MESSAGES.PENDING_USER_NOT_FOUND);

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

async function listUsers() {
  return User.find().sort({ lastName: 1, firstName: 1, createdAt: 1 });
}

async function createUser(payload) {
  const data = parseAdminCreateUserPayload(payload);

  await assertUniqueUserFields({
    email: data.email,
    idNumber: data.idNumber,
  });

  return User.create({
    ...data,
    status: USER_STATUS.ACTIVE,
  });
}

async function updateUser(rawId, payload) {
  const id = parseUserId(rawId);
  const data = parseAdminUpdateUserPayload(payload);

  await assertUniqueUserFields({
    email: data.email,
    idNumber: data.idNumber,
    excludeId: id,
  });

  const user = await User.findById(id).select('+password');

  if (!user) {
    throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, 404);
  }

  Object.entries(data).forEach(([field, value]) => {
    if (field === 'classId' && value === null) {
      user.classId = undefined;
      return;
    }

    user[field] = value;
  });

  await user.save();
  return user;
}

async function deleteUser(rawId, { actorId } = {}) {
  const id = parseUserId(rawId);

  if (actorId && String(actorId) === id) {
    throw new AppError(ERROR_MESSAGES.CANNOT_DELETE_SELF, 400);
  }

  const deletedUser = await User.findByIdAndDelete(id);

  if (!deletedUser) {
    throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, 404);
  }

  return deletedUser;
}

async function searchStudents(query = {}) {
  const rawName = typeof query.name === 'string' ? query.name.trim() : '';

  if (!rawName) {
    throw studentNotFoundError();
  }

  const escaped = escapeRegex(rawName.slice(0, STUDENT_SEARCH_MAX_LENGTH));

  let users;

  try {
    const nameRegex = new RegExp(escaped, 'i');

    users = await User.find({
      role: USER_ROLE.STUDENT,
      $or: [
        { firstName: nameRegex },
        { lastName: nameRegex },
        {
          $expr: {
            $regexMatch: {
              input: { $concat: ['$firstName', ' ', '$lastName'] },
              regex: escaped,
              options: 'i',
            },
          },
        },
      ],
    })
      .select('firstName lastName profileImage classId idNumber')
      .sort({ lastName: 1, firstName: 1, createdAt: 1 })
      .limit(STUDENT_SEARCH_LIMIT);
  } catch (error) {
    console.error('[users] student search failed', error);
    throw studentNotFoundError();
  }

  if (!users || users.length === 0) {
    throw studentNotFoundError();
  }

  return users;
}

module.exports = {
  listPendingUsers,
  approveUser,
  rejectUser,
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  searchStudents,
};
