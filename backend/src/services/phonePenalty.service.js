const Attendance = require('../models/Attendance.model');
const User = require('../models/User');
const { ACTIVITY_TYPE, ATTENDANCE_STATUS } = require('../constants/attendance');
const {
  ATTENDANCE_PENALTY_STATE,
  PHONE_DEPOSIT_STATUS,
  PHONE_PENALTY_RULES,
} = require('../constants/phonePenalties');
const { USER_ROLE, USER_STATUS } = require('../constants/user');
const { getCronTimezone } = require('../config/cron');
const { getTodayUtcDate, normalizeToUtcDate } = require('../utils/time');

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

function getRequiredCleanWeeks(status) {
  return status === ATTENDANCE_STATUS.LATE
    ? PHONE_PENALTY_RULES.LATE_EXPIRY_CLEAN_WEEKS
    : PHONE_PENALTY_RULES.ABSENCE_EXPIRY_CLEAN_WEEKS;
}

function getConsecutiveCleanWeeks(lastInfractionDate, todayUtc) {
  const lastDate = normalizeToUtcDate(lastInfractionDate);
  const today = normalizeToUtcDate(todayUtc);
  const cleanDays = Math.max(
    0,
    Math.round((today.getTime() - lastDate.getTime()) / PHONE_PENALTY_RULES.MS_PER_DAY),
  );

  return Math.floor(cleanDays / 7);
}

function getDepositReadyAt(startedAt) {
  if (!startedAt) {
    return null;
  }

  return new Date(
    new Date(startedAt).getTime() +
      PHONE_PENALTY_RULES.DEPOSIT_DURATION_DAYS * PHONE_PENALTY_RULES.MS_PER_DAY,
  );
}

async function expireStudentInfractions(studentId, todayUtc) {
  const infractions = await listActivePrayerInfractions(studentId);

  if (infractions.length === 0) {
    return [];
  }

  let remainingWeeks = getConsecutiveCleanWeeks(infractions[infractions.length - 1].date, todayUtc);
  const expired = [];

  for (const infraction of infractions) {
    const requiredWeeks = getRequiredCleanWeeks(infraction.status);

    if (remainingWeeks < requiredWeeks) {
      break;
    }

    infraction.penaltyState = ATTENDANCE_PENALTY_STATE.CONSUMED;
    await infraction.save();
    remainingWeeks -= requiredWeeks;
    expired.push(infraction);
  }

  return expired;
}

async function expireStaleAttendancePenalties(todayUtc = getTodayUtcDate(getCronTimezone())) {
  const students = await User.find({
    role: USER_ROLE.STUDENT,
    status: USER_STATUS.ACTIVE,
  }).select('_id');

  const expiredByStudent = [];

  for (const student of students) {
    const expired = await expireStudentInfractions(student._id, todayUtc);

    if (expired.length > 0) {
      expiredByStudent.push({
        studentId: String(student._id),
        expiredCount: expired.length,
      });
    }
  }

  return expiredByStudent;
}

async function promoteCompletedPhoneDeposits(now = new Date()) {
  const result = await User.updateMany(
    {
      role: USER_ROLE.STUDENT,
      phoneDepositStatus: PHONE_DEPOSIT_STATUS.DEPOSITED,
      phoneDepositStartedAt: { $ne: null, $lte: new Date(now.getTime() - PHONE_PENALTY_RULES.DEPOSIT_DURATION_DAYS * PHONE_PENALTY_RULES.MS_PER_DAY) },
    },
    {
      $set: {
        phoneDepositStatus: PHONE_DEPOSIT_STATUS.READY_FOR_RETURN,
      },
    },
  );

  return result.modifiedCount || 0;
}

async function runDailyPhonePenaltyMaintenance(now = new Date()) {
  const todayUtc = getTodayUtcDate(getCronTimezone());
  const expired = await expireStaleAttendancePenalties(todayUtc);
  const evaluated = await evaluateAllActiveStudentPenalties();
  const promoted = await promoteCompletedPhoneDeposits(now);

  return {
    expiredStudents: expired.length,
    evaluatedStudents: evaluated.length,
    promotedDeposits: promoted,
  };
}

module.exports = {
  buildActivePrayerInfractionFilter,
  convertLatesToAbsences,
  countActivePrayerAbsences,
  evaluateAllActiveStudentPenalties,
  evaluatePrayerAttendancePenalties,
  evaluateStudentPhonePenalty,
  expireStaleAttendancePenalties,
  expireStudentInfractions,
  getConsecutiveCleanWeeks,
  getDepositReadyAt,
  listActivePrayerInfractions,
  promoteCompletedPhoneDeposits,
  runDailyPhonePenaltyMaintenance,
};
