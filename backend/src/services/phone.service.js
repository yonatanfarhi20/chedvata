const PhoneDepositLog = require('../models/PhoneDepositLog.model');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { ERROR_MESSAGES } = require('../constants/errors');
const { USER_ROLE, USER_STATUS } = require('../constants/user');
const { getPhoneDepositDeadline, getPhoneDepositTimezone } = require('../constants/phones');
const { getTodayUtcDate } = require('../utils/time');
const { isPastPhoneDepositDeadline, isPhoneDepositAlertRequired } = require('../utils/phoneAlerts');
const { parsePhoneDepositPayload } = require('../validators/phones');

function getTodayDepositDate() {
  return getTodayUtcDate(getPhoneDepositTimezone());
}

function toStudentDepositStatus(student, log, now = new Date()) {
  const isDeposited = Boolean(log?.isDeposited);

  return {
    studentId: student._id,
    firstName: student.firstName,
    lastName: student.lastName,
    classId: student.classId || null,
    isDeposited,
    depositTime: log?.depositTime || null,
    reportedBy: log?.reportedBy || null,
    isAlertRequired: isPhoneDepositAlertRequired(isDeposited, now),
  };
}

async function listActiveStudents() {
  return User.find({
    role: USER_ROLE.STUDENT,
    status: USER_STATUS.ACTIVE,
  })
    .select('firstName lastName classId')
    .sort({ lastName: 1, firstName: 1, createdAt: 1 });
}

async function getDailyStatus() {
  const now = new Date();
  const date = getTodayDepositDate();
  const deadline = getPhoneDepositDeadline();
  const students = await listActiveStudents();
  const logs = await PhoneDepositLog.find({ date });
  const logsByStudentId = new Map(logs.map((log) => [String(log.studentId), log]));

  return {
    date,
    deadline: {
      ...deadline,
      timeZone: getPhoneDepositTimezone(),
    },
    isPastDeadline: isPastPhoneDepositDeadline(now),
    students: students.map((student) =>
      toStudentDepositStatus(student, logsByStudentId.get(String(student._id)), now),
    ),
  };
}

async function toggleDeposit(payload, { reportedBy } = {}) {
  const { studentId, isDeposited } = parsePhoneDepositPayload(payload);
  const student = await User.findOne({
    _id: studentId,
    role: USER_ROLE.STUDENT,
    status: USER_STATUS.ACTIVE,
  }).select('firstName lastName classId');

  if (!student) {
    throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, 404);
  }

  const date = getTodayDepositDate();
  const now = new Date();
  const log = await PhoneDepositLog.findOneAndUpdate(
    { studentId, date },
    {
      $set: {
        studentId,
        date,
        isDeposited,
        reportedBy,
        depositTime: isDeposited ? now : null,
      },
    },
    { upsert: true, new: true, runValidators: true },
  );

  return {
    date,
    student: toStudentDepositStatus(student, log, now),
  };
}

module.exports = {
  getDailyStatus,
  toggleDeposit,
};
