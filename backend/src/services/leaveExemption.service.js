const Attendance = require('../models/Attendance.model');
const Vacation = require('../models/Vacation.model');
const { ATTENDANCE_PENALTY_STATE } = require('../constants/phonePenalties');
const { VACATION_STATUS } = require('../constants/vacations');
const { normalizeToUtcDate } = require('../utils/time');

/**
 * Bridges approved vacations and attendance reporting.
 *
 * Attendance on a leave day is reported as usual (the student shows up as absent
 * in every table), but the record is flagged as exempt so it is never picked up
 * by the phone-deposit sanctions.
 */

function buildApprovedLeaveFilter({ startDate, endDate, studentIds }) {
  const filter = {
    status: VACATION_STATUS.APPROVED,
    startDate: { $lte: normalizeToUtcDate(endDate) },
    endDate: { $gte: normalizeToUtcDate(startDate) },
  };

  if (Array.isArray(studentIds)) {
    filter.studentId = { $in: studentIds };
  }

  return filter;
}

function setPenaltyState(filter, penaltyState) {
  return Attendance.updateMany(filter, { $set: { penaltyState } });
}

/**
 * @returns {Promise<string[]>} ids of the students whose approved leave covers the date.
 */
async function listStudentIdsOnApprovedLeave(date, studentIds) {
  if (Array.isArray(studentIds) && studentIds.length === 0) {
    return [];
  }

  const ids = await Vacation.distinct(
    'studentId',
    buildApprovedLeaveFilter({ startDate: date, endDate: date, studentIds }),
  );

  return ids.map(String);
}

/**
 * Aligns the penalty state of freshly reported attendance with the leave status
 * of every student in the report.
 *
 * @returns {Promise<string[]>} ids of the students exempted for that date.
 */
async function syncLeaveExemptions({ date, activityType, studentIds = [] }) {
  const onLeave = new Set(await listStudentIdsOnApprovedLeave(date, studentIds));
  const exemptIds = studentIds.filter((studentId) => onLeave.has(String(studentId)));
  const chargeableIds = studentIds.filter((studentId) => !onLeave.has(String(studentId)));
  const scope = { date: normalizeToUtcDate(date), activityType };

  await Promise.all([
    exemptIds.length > 0
      ? setPenaltyState(
          {
            ...scope,
            studentId: { $in: exemptIds },
            penaltyState: ATTENDANCE_PENALTY_STATE.ACTIVE,
          },
          ATTENDANCE_PENALTY_STATE.EXEMPT,
        )
      : null,
    chargeableIds.length > 0
      ? setPenaltyState(
          {
            ...scope,
            studentId: { $in: chargeableIds },
            penaltyState: ATTENDANCE_PENALTY_STATE.EXEMPT,
          },
          ATTENDANCE_PENALTY_STATE.ACTIVE,
        )
      : null,
  ]);

  return exemptIds.map(String);
}

/**
 * Exempts attendance that was already reported for a leave range, so approving a
 * vacation after the fact cannot leave chargeable infractions behind.
 *
 * @returns {Promise<number>} amount of attendance records exempted.
 */
async function exemptAttendanceForLeave({ studentId, startDate, endDate } = {}) {
  if (!studentId || !startDate || !endDate) {
    return 0;
  }

  const result = await setPenaltyState(
    {
      studentId,
      date: {
        $gte: normalizeToUtcDate(startDate),
        $lte: normalizeToUtcDate(endDate),
      },
      penaltyState: ATTENDANCE_PENALTY_STATE.ACTIVE,
    },
    ATTENDANCE_PENALTY_STATE.EXEMPT,
  );

  return result.modifiedCount || 0;
}

module.exports = {
  exemptAttendanceForLeave,
  listStudentIdsOnApprovedLeave,
  syncLeaveExemptions,
};
