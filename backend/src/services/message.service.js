const Message = require('../models/Message.model');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { ERROR_MESSAGES } = require('../constants/errors');
const { MESSAGE_TYPE } = require('../constants/messages');
const { USER_ROLE, USER_STATUS, SENIOR_MANAGEMENT_ROLES } = require('../constants/user');
const { parseMessagePayload } = require('../validators/messages');
const { getUserClassId } = require('../utils/userClass');

function isSameClassId(left, right) {
  if (!left || !right) {
    return false;
  }

  return String(left) === String(right);
}

function buildInboxQuery(user) {
  const clauses = [{ recipientId: user._id }, { messageType: MESSAGE_TYPE.ALL }];
  const classId = getUserClassId(user);

  if (classId) {
    clauses.push({ classId });
  }

  return { $or: clauses };
}

async function assertRecipientExists(recipientId) {
  const student = await User.findOne({
    _id: recipientId,
    role: USER_ROLE.STUDENT,
    status: USER_STATUS.ACTIVE,
  }).select('_id classId');

  if (!student) {
    throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, 404);
  }

  return student;
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

function assertCanBroadcast(sender) {
  if (SENIOR_MANAGEMENT_ROLES.includes(sender.role)) {
    return;
  }

  throw new AppError(ERROR_MESSAGES.MESSAGE_BROADCAST_FORBIDDEN, 403);
}

function assertRabbiCanSend(sender, data, recipient) {
  if (sender.role !== USER_ROLE.RABBI) {
    return;
  }

  if (data.messageType === MESSAGE_TYPE.ALL) {
    throw new AppError(ERROR_MESSAGES.MESSAGE_BROADCAST_FORBIDDEN, 403);
  }

  const rabbiClassId = getUserClassId(sender);

  if (!rabbiClassId) {
    throw new AppError(ERROR_MESSAGES.MESSAGE_NOT_IN_RABBI_CLASS, 403);
  }

  if (data.classId && !isSameClassId(data.classId, rabbiClassId)) {
    throw new AppError(ERROR_MESSAGES.MESSAGE_NOT_IN_RABBI_CLASS, 403);
  }

  if (recipient && !isSameClassId(recipient.classId, rabbiClassId)) {
    throw new AppError(ERROR_MESSAGES.MESSAGE_NOT_IN_RABBI_CLASS, 403);
  }
}

async function listMessages(user) {
  if (!user?._id) {
    throw new AppError(ERROR_MESSAGES.UNAUTHORIZED, 401);
  }

  return Message.find(buildInboxQuery(user))
    .populate('senderId', 'firstName lastName role')
    .sort({ createdAt: -1 });
}

async function createMessage(payload, sender) {
  if (!sender?._id) {
    throw new AppError(ERROR_MESSAGES.UNAUTHORIZED, 401);
  }

  const data = parseMessagePayload(payload);
  let recipient;

  if (data.messageType === MESSAGE_TYPE.ALL) {
    assertCanBroadcast(sender);
  } else if (data.recipientId) {
    recipient = await assertRecipientExists(data.recipientId);
  } else if (data.classId) {
    await assertClassExists(data.classId);
  }

  assertRabbiCanSend(sender, data, recipient);

  return Message.create({
    ...data,
    senderId: sender._id,
  });
}

module.exports = {
  listMessages,
  createMessage,
};
