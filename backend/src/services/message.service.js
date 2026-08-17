const Message = require('../models/Message.model');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { ERROR_MESSAGES } = require('../constants/errors');
const { USER_ROLE, USER_STATUS } = require('../constants/user');
const { parseMessagePayload } = require('../validators/messages');

async function assertRecipientExists(recipientId) {
  const student = await User.findOne({
    _id: recipientId,
    role: USER_ROLE.STUDENT,
    status: USER_STATUS.ACTIVE,
  }).select('_id');

  if (!student) {
    throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, 404);
  }
}

async function assertClassExists(classId) {
  const studentCount = await User.countDocuments({
    classId,
    role: USER_ROLE.STUDENT,
    status: USER_STATUS.ACTIVE,
  });

  if (studentCount === 0) {
    throw new AppError(ERROR_MESSAGES.INVALID_CLASS_ID, 404);
  }
}

async function createMessage(payload, { senderId } = {}) {
  const data = parseMessagePayload(payload);

  if (data.recipientId) {
    await assertRecipientExists(data.recipientId);
  } else if (data.classId) {
    await assertClassExists(data.classId);
  }

  return Message.create({
    ...data,
    senderId,
  });
}

module.exports = {
  createMessage,
};
