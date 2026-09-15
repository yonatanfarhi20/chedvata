const Attendance = require('../models/Attendance.model');
const User = require('../models/User');
const { getCronTimezone } = require('../config/cron');
const { ACTIVITY_TYPE, ATTENDANCE_STATUS } = require('../constants/attendance');
const { DASHBOARD_PERIOD, HEBREW_WEEKDAYS } = require('../constants/rabbiDashboard');
const { getTodayUtcDate, getZonedDateTimeParts, normalizeToUtcDate } = require('../utils/time');
const {
  buildRabbiClassStudentFilter,
  resolveRabbiClassId,
} = require('./lessonAttendance.service');

const SATURDAY = 6;

function toIsoDate(date) {
  const normalized = normalizeToUtcDate(date);
  const year = normalized.getUTCFullYear();
  const month = String(normalized.getUTCMonth() + 1).padStart(2, '0');
  const day = String(normalized.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addUtcDays(date, days) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function emptyCounts() {
  return {
    [ATTENDANCE_STATUS.PRESENT]: 0,
    [ATTENDANCE_STATUS.LATE]: 0,
    [ATTENDANCE_STATUS.ABSENT]: 0,
  };
}

function getPresentPercent(counts) {
  const denominator =
    counts[ATTENDANCE_STATUS.PRESENT] +
    counts[ATTENDANCE_STATUS.LATE] +
    counts[ATTENDANCE_STATUS.ABSENT];

  if (denominator === 0) {
    return null;
  }

  return Math.round((counts[ATTENDANCE_STATUS.PRESENT] / denominator) * 100);
}

function getPeriodRange(period, timeZone) {
  const today = getTodayUtcDate(timeZone);
  const { year, month } = getZonedDateTimeParts(new Date(), timeZone);

  if (period === DASHBOARD_PERIOD.WEEK) {
    const from = addUtcDays(today, -today.getUTCDay());
    return { from, to: addUtcDays(from, 6) };
  }

  if (period === DASHBOARD_PERIOD.MONTH) {
    return {
      from: new Date(Date.UTC(year, month - 1, 1)),
      to: new Date(Date.UTC(year, month, 0)),
    };
  }

  return {
    from: new Date(Date.UTC(year, 0, 1)),
    to: new Date(Date.UTC(year, 11, 31)),
  };
}

function getBucketKey(date, period) {
  const isoDate = toIsoDate(date);
  return period === DASHBOARD_PERIOD.YEAR ? isoDate.slice(0, 7) : isoDate;
}

function buildBucketKeys(period, from, to) {
  if (period === DASHBOARD_PERIOD.YEAR) {
    const year = from.getUTCFullYear();
    return Array.from({ length: 12 }, (_, month) => `${year}-${String(month + 1).padStart(2, '0')}`);
  }

  const keys = [];
  const cursor = new Date(from);

  while (cursor <= to) {
    if (cursor.getUTCDay() !== SATURDAY) {
      keys.push(toIsoDate(cursor));
    }

    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return keys;
}

function formatPointLabel(bucketKey, period) {
  if (period === DASHBOARD_PERIOD.YEAR) {
    const [year, month] = bucketKey.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString('he-IL', {
      month: 'long',
      timeZone: 'UTC',
    });
  }

  const date = new Date(`${bucketKey}T00:00:00.000Z`);
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');

  if (period === DASHBOARD_PERIOD.WEEK) {
    return HEBREW_WEEKDAYS[date.getUTCDay()];
  }

  return `${day}/${month}`;
}

function formatPeriodTitle(period, from) {
  if (period === DASHBOARD_PERIOD.WEEK) {
    return 'השבוע הנוכחי';
  }

  if (period === DASHBOARD_PERIOD.MONTH) {
    return from.toLocaleDateString('he-IL', {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    });
  }

  return `שנת ${from.getUTCFullYear()}`;
}

function toPointCounts(row) {
  const counts = emptyCounts();

  counts[ATTENDANCE_STATUS.PRESENT] = Number(row?.present) || 0;
  counts[ATTENDANCE_STATUS.LATE] = Number(row?.late) || 0;
  counts[ATTENDANCE_STATUS.ABSENT] = Number(row?.absent) || 0;

  return counts;
}

function buildPoint(bucketKey, period, counts) {
  const present = counts[ATTENDANCE_STATUS.PRESENT];
  const late = counts[ATTENDANCE_STATUS.LATE];
  const absent = counts[ATTENDANCE_STATUS.ABSENT];

  return {
    key: bucketKey,
    label: formatPointLabel(bucketKey, period),
    percentage: getPresentPercent(counts),
    present,
    late,
    absent,
    counted: present + late + absent,
  };
}

async function getRabbiDashboard(actor, { period } = {}) {
  const timeZone = getCronTimezone();
  const selectedPeriod = period || DASHBOARD_PERIOD.WEEK;
  const { from, to } = getPeriodRange(selectedPeriod, timeZone);
  const classId = resolveRabbiClassId(actor);
  const students = await User.find(buildRabbiClassStudentFilter(actor)).select('_id');
  const studentIds = students.map((student) => student._id);
  const groupFormat = selectedPeriod === DASHBOARD_PERIOD.YEAR ? '%Y-%m' : '%Y-%m-%d';

  const groupedRows =
    studentIds.length === 0
      ? []
      : await Attendance.aggregate([
          {
            $match: {
              studentId: { $in: studentIds },
              activityType: ACTIVITY_TYPE.LESSON,
              date: { $gte: from, $lte: to },
              status: {
                $in: [ATTENDANCE_STATUS.PRESENT, ATTENDANCE_STATUS.LATE, ATTENDANCE_STATUS.ABSENT],
              },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: groupFormat,
                  date: '$date',
                  timezone: 'UTC',
                },
              },
              present: {
                $sum: { $cond: [{ $eq: ['$status', ATTENDANCE_STATUS.PRESENT] }, 1, 0] },
              },
              late: {
                $sum: { $cond: [{ $eq: ['$status', ATTENDANCE_STATUS.LATE] }, 1, 0] },
              },
              absent: {
                $sum: { $cond: [{ $eq: ['$status', ATTENDANCE_STATUS.ABSENT] }, 1, 0] },
              },
            },
          },
        ]);

  const countsByKey = new Map(groupedRows.map((row) => [row._id, toPointCounts(row)]));
  const totals = emptyCounts();
  const points = buildBucketKeys(selectedPeriod, from, to).map((bucketKey) => {
    const counts = countsByKey.get(bucketKey) || emptyCounts();
    totals[ATTENDANCE_STATUS.PRESENT] += counts[ATTENDANCE_STATUS.PRESENT];
    totals[ATTENDANCE_STATUS.LATE] += counts[ATTENDANCE_STATUS.LATE];
    totals[ATTENDANCE_STATUS.ABSENT] += counts[ATTENDANCE_STATUS.ABSENT];
    return buildPoint(bucketKey, selectedPeriod, counts);
  });

  return {
    period: selectedPeriod,
    from: toIsoDate(from),
    to: toIsoDate(to),
    title: formatPeriodTitle(selectedPeriod, from),
    classId: String(classId),
    studentCount: studentIds.length,
    averagePercent: getPresentPercent(totals),
    points,
  };
}

module.exports = {
  getPeriodRange,
  getPresentPercent,
  getRabbiDashboard,
};
