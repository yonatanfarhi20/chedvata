const Attendance = require('../models/Attendance.model');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { ERROR_MESSAGES } = require('../constants/errors');
const {
  ATTENDANCE_PENALTY_STATE,
  PHONE_DEPOSIT_STATUS,
} = require('../constants/phonePenalties');
const { USER_ROLE, USER_STATUS } = require('../constants/user');
const {
  buildActivePrayerInfractionFilter,
  countActivePrayerAbsences,
  getDepositReadyAt,
  promoteCompletedPhoneDeposits,
} = require('./phonePenalty.service');

async function findActiveStudent(studentId) {
  const student = await User.findOne({
    _id: studentId,
    role: USER_ROLE.STUDENT,
    status: USER_STATUS.ACTIVE,
  }).select('firstName lastName classId phoneDepositStatus phoneDepositStartedAt');

  if (!student) {
    throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, 404);
  }

  return student;
}

async function toPenaltyStudentDto(student, now = new Date()) {
  const absenceCount = await countActivePrayerAbsences(student._id);
  const readyAt = getDepositReadyAt(student.phoneDepositStartedAt);
  const remainingMs = readyAt ? Math.max(0, readyAt.getTime() - now.getTime()) : 0;

  return {
    studentId: student._id,
    firstName: student.firstName,
    lastName: student.lastName,
    classId: student.classId || null,
    phoneDepositStatus: student.phoneDepositStatus,
    phoneDepositStartedAt: student.phoneDepositStartedAt,
    absenceCount,
    remainingMs,
    readyAt,
  };
}

async function listPhonePenaltyQueues() {
  await promoteCompletedPhoneDeposits();

  const students = await User.find({
    role: USER_ROLE.STUDENT,
    status: USER_STATUS.ACTIVE,
    phoneDepositStatus: {
      $in: [
        PHONE_DEPOSIT_STATUS.PENDING_DEPOSIT,
        PHONE_DEPOSIT_STATUS.DEPOSITED,
        PHONE_DEPOSIT_STATUS.READY_FOR_RETURN,
      ],
    },
  })
    .select('firstName lastName classId phoneDepositStatus phoneDepositStartedAt')
    .sort({ lastName: 1, firstName: 1, createdAt: 1 });

  const now = new Date();
  const mapped = [];

  for (const student of students) {
    mapped.push(await toPenaltyStudentDto(student, now));
  }

  return {
    pendingDeposit: mapped.filter(
      (student) => student.phoneDepositStatus === PHONE_DEPOSIT_STATUS.PENDING_DEPOSIT,
    ),
    deposited: mapped.filter(
      (student) => student.phoneDepositStatus === PHONE_DEPOSIT_STATUS.DEPOSITED,
    ),
    readyForReturn: mapped.filter(
      (student) => student.phoneDepositStatus === PHONE_DEPOSIT_STATUS.READY_FOR_RETURN,
    ),
  };
}

async function confirmPhoneDeposit(studentId) {
  const student = await findActiveStudent(studentId);

  if (student.phoneDepositStatus !== PHONE_DEPOSIT_STATUS.PENDING_DEPOSIT) {
    throw new AppError(ERROR_MESSAGES.PHONE_PENALTY_INVALID_TRANSITION, 400);
  }

  student.phoneDepositStatus = PHONE_DEPOSIT_STATUS.DEPOSITED;
  student.phoneDepositStartedAt = new Date();
  await student.save();

  return toPenaltyStudentDto(student);
}

async function confirmPhoneReturn(studentId) {
  const student = await findActiveStudent(studentId);

  if (student.phoneDepositStatus !== PHONE_DEPOSIT_STATUS.READY_FOR_RETURN) {
    throw new AppError(ERROR_MESSAGES.PHONE_PENALTY_INVALID_TRANSITION, 400);
  }

  await Attendance.updateMany(buildActivePrayerInfractionFilter(student._id), {
    $set: {
      penaltyState: ATTENDANCE_PENALTY_STATE.CONSUMED,
    },
  });

  student.phoneDepositStatus = PHONE_DEPOSIT_STATUS.NONE;
  student.phoneDepositStartedAt = null;
  await student.save();

  return toPenaltyStudentDto(student);
}

module.exports = {
  confirmPhoneDeposit,
  confirmPhoneReturn,
  listPhonePenaltyQueues,
};
