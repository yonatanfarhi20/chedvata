const Attendance = require('../models/Attendance.model');
const User = require('../models/User');
const { ACTIVITY_TYPE, ATTENDANCE_STATUS } = require('../constants/attendance');
const {
  ATTENDANCE_PENALTY_STATE,
  PHONE_DEPOSIT_STATUS,
  PHONE_PENALTY_RULES,
} = require('../constants/phonePenalties');
const { USER_ROLE, USER_STATUS } = require('../constants/user');

function buildActivePrayerInfractionFilter(studentId, extra = {}) {
  return {
    studentId,
    activityType: ACTIVITY_TYPE.PRAYER,
    penaltyState: ATTENDANCE_PENALTY_STATE.ACTIVE,
    status: { $in: [ATTENDANCE_STATUS.LATE, ATTENDANCE_STATUS.ABSENT] },
    ...extra,
  };
}

async function listActivePrayerInfractions(studentId, status) {
  return Attendance.find({
    ...buildActivePrayerInfractionFilter(studentId),
    ...(status ? { status } : {}),
  }).sort({ date: 1, createdAt: 1 });
}

async function convertLatesToAbsences(studentId) {
  const lates = await listActivePrayerInfractions(studentId, ATTENDANCE_STATUS.LATE);
  const pairCount = Math.floor(lates.length / PHONE_PENALTY_RULES.LATES_PER_ABSENCE);

  for (let index = 0; index < pairCount; index += 1) {
    const convertedAbsence = lates[index * PHONE_PENALTY_RULES.LATES_PER_ABSENCE];
    const consumedLate = lates[index * PHONE_PENALTY_RULES.LATES_PER_ABSENCE + 1];

    convertedAbsence.status = ATTENDANCE_STATUS.ABSENT;
    consumedLate.penaltyState = ATTENDANCE_PENALTY_STATE.CONSUMED;

    await convertedAbsence.save();
    await consumedLate.save();
  }

  return pairCount;
}

async function countActivePrayerAbsences(studentId) {
  return Attendance.countDocuments({
    ...buildActivePrayerInfractionFilter(studentId, { status: ATTENDANCE_STATUS.ABSENT }),
  });
}

async function markStudentPendingDepositIfNeeded(studentId, absenceCount) {
  if (absenceCount < PHONE_PENALTY_RULES.ABSENCES_FOR_DEPOSIT) {
    return null;
  }

  const student = await User.findOneAndUpdate(
    {
      _id: studentId,
      role: USER_ROLE.STUDENT,
      phoneDepositStatus: PHONE_DEPOSIT_STATUS.NONE,
    },
    {
      $set: {
        phoneDepositStatus: PHONE_DEPOSIT_STATUS.PENDING_DEPOSIT,
        phoneDepositStartedAt: null,
      },
    },
    { new: true },
  );

  return student;
}

async function evaluateStudentPhonePenalty(studentId) {
  const convertedPairs = await convertLatesToAbsences(studentId);
  const absenceCount = await countActivePrayerAbsences(studentId);
  const student = await markStudentPendingDepositIfNeeded(studentId, absenceCount);

  return {
    studentId: String(studentId),
    convertedPairs,
    absenceCount,
    phoneDepositStatus: student?.phoneDepositStatus || undefined,
  };
}

async function evaluatePrayerAttendancePenalties(studentIds = []) {
  const uniqueStudentIds = [...new Set(studentIds.map((id) => String(id)))];

  const results = [];
  for (const studentId of uniqueStudentIds) {
    results.push(await evaluateStudentPhonePenalty(studentId));
  }

  return results;
}

async function evaluateAllActiveStudentPenalties() {
  const students = await User.find({
    role: USER_ROLE.STUDENT,
    status: USER_STATUS.ACTIVE,
  }).select('_id');

  return evaluatePrayerAttendancePenalties(students.map((student) => student._id));
}

module.exports = {
  buildActivePrayerInfractionFilter,
  convertLatesToAbsences,
  countActivePrayerAbsences,
  evaluateAllActiveStudentPenalties,
  evaluatePrayerAttendancePenalties,
  evaluateStudentPhonePenalty,
  listActivePrayerInfractions,
};
