const Attendance = require('../models/Attendance.model');
const User = require('../models/User');
const { ACTIVITY_TYPE, ATTENDANCE_STATUS } = require('../constants/attendance');
const { PHONE_PENALTY_RULES } = require('../constants/phonePenalties');
const { LESSON_DAY_REASON, LESSON_DAY_STATUS } = require('../constants/studentDashboard');
const { USER_ROLE, USER_STATUS } = require('../constants/user');
const { getCronTimezone } = require('../config/cron');
const { getTodayUtcDate, getZonedDateTimeParts, normalizeToUtcDate } = require('../utils/time');
const {
  buildInfractionDeletionTimeline,
  listActivePrayerInfractions,
} = require('./phonePenalty.service');
const { getQuotaSnapshot } = require('./vacation.service');

function toIsoDate(date) {
  const normalized = normalizeToUtcDate(date);
  const year = normalized.getUTCFullYear();
  const month = String(normalized.getUTCMonth() + 1).padStart(2, '0');
  const day = String(normalized.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getLessonDayStatus(date, recordsByDate) {
  const isoDate = toIsoDate(date);
  const weekday = date.getUTCDay();

  if (weekday === 6) {
    return {
      date: isoDate,
      day: date.getUTCDate(),
      weekday,
      status: LESSON_DAY_STATUS.NONE,
      reason: LESSON_DAY_REASON.SHABBAT,
    };
  }

  const record = recordsByDate.get(isoDate);

  if (!record || record.status === ATTENDANCE_STATUS.ON_LEAVE) {
    return {
      date: isoDate,
      day: date.getUTCDate(),
      weekday,
      status: LESSON_DAY_STATUS.NONE,
      reason: record ? LESSON_DAY_REASON.LEAVE : LESSON_DAY_REASON.NO_LESSON,
    };
  }

  return {
    date: isoDate,
    day: date.getUTCDate(),
    weekday,
    status: record.status,
    reason: null,
  };
}

function buildLessonCalendarDays(year, month, records) {
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const recordsByDate = new Map(
    (Array.isArray(records) ? records : []).map((record) => [toIsoDate(record.date), record]),
  );

  const days = [];

  for (let day = 1; day <= lastDay; day += 1) {
    days.push(getLessonDayStatus(new Date(Date.UTC(year, month - 1, day)), recordsByDate));
  }

  return days;
}

async function getClassAffiliation(student) {
  const classId = student?.classId;

  if (!classId) {
    return {
      classId: null,
      rabbi: null,
    };
  }

  const rabbi = await User.findOne({
    role: USER_ROLE.RABBI,
    status: USER_STATUS.ACTIVE,
    $or: [{ _id: classId }, { classId }],
  }).select('firstName lastName');

  return {
    classId: String(classId),
    rabbi: rabbi
      ? {
          id: String(rabbi._id),
          firstName: rabbi.firstName,
          lastName: rabbi.lastName,
        }
      : null,
  };
}

async function getStudentDashboard(student) {
  const studentId = student?._id;
  const timeZone = getCronTimezone();
  const todayUtc = getTodayUtcDate(timeZone);
  const { year, month } = getZonedDateTimeParts(new Date(), timeZone);
  const monthStart = new Date(Date.UTC(year, month - 1, 1));
  const monthEnd = new Date(Date.UTC(year, month, 0));

  const [classAffiliation, quota, infractions, lessonRecords] = await Promise.all([
    getClassAffiliation(student),
    getQuotaSnapshot(studentId),
    listActivePrayerInfractions(studentId),
    Attendance.find({
      studentId,
      activityType: ACTIVITY_TYPE.LESSON,
      date: { $gte: monthStart, $lte: monthEnd },
    }).select('date status'),
  ]);

  const activeAbsences = infractions.filter(
    (infraction) => infraction.status === ATTENDANCE_STATUS.ABSENT,
  ).length;

  return {
    classAffiliation,
    vacations: {
      year: quota.year,
      annualQuota: quota.annualQuota,
      usedDays: quota.usedDays,
      remainingDays: quota.remainingDays,
    },
    prayers: {
      activeAbsences,
      maxAbsences: PHONE_PENALTY_RULES.ABSENCES_FOR_DEPOSIT,
      events: buildInfractionDeletionTimeline(infractions, todayUtc),
    },
    lessons: {
      year,
      month,
      days: buildLessonCalendarDays(year, month, lessonRecords),
    },
  };
}

module.exports = {
  buildLessonCalendarDays,
  getStudentDashboard,
};
