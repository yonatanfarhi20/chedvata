const Leave = require('../models/Leave.model');
const Message = require('../models/Message.model');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { ERROR_MESSAGES } = require('../constants/errors');
const { USER_ROLE, USER_STATUS } = require('../constants/user');
const {
  LEAVE_NOTIFICATION_SUBJECT,
  buildLeaveNotificationContent,
} = require('../constants/leaves');
const { parseLeavePayload } = require('../validators/leaves');

async function findActiveStudent(studentId) {
  const student = await User.findOne({
    _id: studentId,
    role: USER_ROLE.STUDENT,
    status: USER_STATUS.ACTIVE,
  }).select('_id firstName lastName');

  if (!student) {
    throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, 404);
  }

  return student;
}

async function notifyStudentOfLeave(leave, { senderId, student } = {}) {
  try {
    await Message.create({
      senderId,
      recipientId: student._id,
      subject: LEAVE_NOTIFICATION_SUBJECT,
      content: buildLeaveNotificationContent(leave),
    });
  } catch (error) {
    console.error('[leaves] failed to create notification message', error);
  }
}

async function createLeave(payload, { senderId } = {}) {
  const data = parseLeavePayload(payload);
  const student = await findActiveStudent(data.studentId);
  const leave = await Leave.create({
    ...data,
    addedByAdmin: true,
  });

  await notifyStudentOfLeave(leave, { senderId, student });

  return leave;
}

module.exports = {
  createLeave,
};
