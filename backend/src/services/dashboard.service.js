const Attendance = require('../models/Attendance.model');
const Leave = require('../models/Leave.model');
const PhoneDepositLog = require('../models/PhoneDepositLog.model');
const User = require('../models/User');
const { ATTENDANCE_STATUS, ACTIVITY_TYPE } = require('../constants/attendance');
const {
  DASHBOARD_ALERT_HREF,
  DASHBOARD_ALERT_TYPE,
  LEAVES_PREVIEW_LIMIT,
  buildAttendanceAbsencesMessage,
  buildPendingApprovalsMessage,
  buildPhoneDepositsMessage,
} = require('../constants/dashboard');
const { USER_ROLE, USER_STATUS } = require('../constants/user');
const { getPhoneDepositTimezone } = require('../constants/phones');
const { isPastPhoneDepositDeadline } = require('../utils/phoneAlerts');
const { getTodayUtcDate } = require('../utils/time');

function getTodayRange(timeZone = getPhoneDepositTimezone()) {
  const start = getTodayUtcDate(timeZone);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  return { start, end };
}

function emptyStatusCounts() {
  return {
    [ATTENDANCE_STATUS.PRESENT]: 0,
    [ATTENDANCE_STATUS.ABSENT]: 0,
    [ATTENDANCE_STATUS.LATE]: 0,
    [ATTENDANCE_STATUS.ON_LEAVE]: 0,
  };
}

function emptyActivityCounts() {
  return {
    [ACTIVITY_TYPE.LESSON]: emptyStatusCounts(),
    [ACTIVITY_TYPE.PRAYER]: emptyStatusCounts(),
  };
}

function getFacetCount(rows) {
  return Number(rows?.[0]?.count) || 0;
}

function applyStatusCounts(rows = []) {
  const counts = emptyStatusCounts();

  rows.forEach((row) => {
    const status = row?._id;

    if (status && Object.prototype.hasOwnProperty.call(counts, status)) {
      counts[status] = Number(row.count) || 0;
    }
  });

  return counts;
}

function applyActivityCounts(rows = []) {
  const counts = emptyActivityCounts();

  rows.forEach((row) => {
    const activityType = row?._id?.activityType;
    const status = row?._id?.status;

    if (
      activityType &&
      status &&
      counts[activityType] &&
      Object.prototype.hasOwnProperty.call(counts[activityType], status)
    ) {
      counts[activityType][status] = Number(row.count) || 0;
    }
  });

  return counts;
}

function getDepositedCount(rows = []) {
  const depositedRow = rows.find((row) => row?._id === true);
  return Number(depositedRow?.count) || 0;
}

function getPresentPercent(counts) {
  const denominator =
    counts[ATTENDANCE_STATUS.PRESENT] +
    counts[ATTENDANCE_STATUS.ABSENT] +
    counts[ATTENDANCE_STATUS.LATE];

  if (denominator === 0) {
    return null;
  }

  return Math.round((counts[ATTENDANCE_STATUS.PRESENT] / denominator) * 100);
}

function buildAlert({ type, count, severity, title, message }) {
  return {
    id: type,
    type,
    severity,
    count,
    title,
    message,
    href: DASHBOARD_ALERT_HREF[type],
  };
}

function buildAlerts({ pendingCount, missingPhones, isPastDeadline, absentCount }) {
  const alerts = [];

  if (pendingCount > 0) {
    alerts.push(
      buildAlert({
        type: DASHBOARD_ALERT_TYPE.PENDING_APPROVALS,
        count: pendingCount,
        severity: 'warning',
        title: 'אישורי הרשמה',
        message: buildPendingApprovalsMessage(pendingCount),
      }),
    );
  }

  if (isPastDeadline && missingPhones > 0) {
    alerts.push(
      buildAlert({
        type: DASHBOARD_ALERT_TYPE.PHONE_DEPOSITS,
        count: missingPhones,
        severity: 'danger',
        title: 'הפקדת טלפונים',
        message: buildPhoneDepositsMessage(missingPhones),
      }),
    );
  }

  if (absentCount > 0) {
    alerts.push(
      buildAlert({
        type: DASHBOARD_ALERT_TYPE.ATTENDANCE_ABSENCES,
        count: absentCount,
        severity: 'warning',
        title: 'נוכחות',
        message: buildAttendanceAbsencesMessage(absentCount),
      }),
    );
  }

  return alerts;
}

function aggregateAttendance(today) {
  return Attendance.aggregate([
    { $match: { date: today } },
    {
      $facet: {
        byStatus: [
          { $group: { _id: { status: '$status', studentId: '$studentId' } } },
          { $group: { _id: '$_id.status', count: { $sum: 1 } } },
        ],
        byActivity: [
          {
            $group: {
              _id: {
                activityType: '$activityType',
                status: '$status',
                studentId: '$studentId',
              },
            },
          },
          {
            $group: {
              _id: { activityType: '$_id.activityType', status: '$_id.status' },
              count: { $sum: 1 },
            },
          },
        ],
      },
    },
  ]);
}

function aggregatePhones(today) {
  return PhoneDepositLog.aggregate([
    { $match: { date: today } },
    {
      $group: {
        _id: '$isDeposited',
        count: { $sum: 1 },
      },
    },
  ]);
}

function aggregateUsers() {
  return User.aggregate([
    {
      $facet: {
        activeStudents: [
          { $match: { role: USER_ROLE.STUDENT, status: USER_STATUS.ACTIVE } },
          { $count: 'count' },
        ],
        pendingApprovals: [
          { $match: { status: USER_STATUS.PENDING_ADMIN_APPROVAL } },
          { $count: 'count' },
        ],
      },
    },
  ]);
}

function aggregateLeaves(today) {
  return Leave.aggregate([
    {
      $match: {
        startDate: { $lte: today },
        endDate: { $gte: today },
      },
    },
    { $group: { _id: '$studentId' } },
    {
      $facet: {
        count: [{ $count: 'count' }],
        students: [
          {
            $lookup: {
              from: User.collection.name,
              localField: '_id',
              foreignField: '_id',
              as: 'student',
            },
          },
          { $unwind: { path: '$student', preserveNullAndEmptyArrays: true } },
          {
            $project: {
              _id: 0,
              studentId: '$_id',
              firstName: '$student.firstName',
              lastName: '$student.lastName',
              classId: '$student.classId',
            },
          },
          { $sort: { lastName: 1, firstName: 1 } },
          { $limit: LEAVES_PREVIEW_LIMIT },
        ],
      },
    },
  ]);
}

async function getDashboardOverview() {
  const now = new Date();
  const { start: today } = getTodayRange();
  const isPastDeadline = isPastPhoneDepositDeadline(now);

  const [attendanceResult, phoneRows, usersResult, leavesResult] = await Promise.all([
    aggregateAttendance(today),
    aggregatePhones(today),
    aggregateUsers(),
    aggregateLeaves(today),
  ]);

  const attendanceFacet = attendanceResult[0] || {};
  const attendance = applyStatusCounts(attendanceFacet.byStatus);
  const byActivity = applyActivityCounts(attendanceFacet.byActivity);

  const usersFacet = usersResult[0] || {};
  const totalStudents = getFacetCount(usersFacet.activeStudents);
  const pendingCount = getFacetCount(usersFacet.pendingApprovals);

  const deposited = getDepositedCount(phoneRows);
  const missing = Math.max(totalStudents - deposited, 0);

  const leavesFacet = leavesResult[0] || {};
  const leavesCount = getFacetCount(leavesFacet.count);
  const leaveStudents = Array.isArray(leavesFacet.students) ? leavesFacet.students : [];

  return {
    date: today,
    attendance: {
      ...attendance,
      presentPercent: getPresentPercent(attendance),
      byActivity,
    },
    phones: {
      deposited,
      missing,
      total: totalStudents,
      isPastDeadline,
    },
    leaves: {
      count: leavesCount,
      students: leaveStudents,
    },
    pendingApprovals: {
      count: pendingCount,
    },
    alerts: buildAlerts({
      pendingCount,
      missingPhones: missing,
      isPastDeadline,
      absentCount: attendance[ATTENDANCE_STATUS.ABSENT],
    }),
  };
}

module.exports = {
  getDashboardOverview,
  getTodayRange,
};
