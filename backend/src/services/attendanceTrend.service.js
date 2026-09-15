const Attendance = require('../models/Attendance.model');
const { getCronTimezone } = require('../config/cron');
const { ATTENDANCE_STATUS } = require('../constants/attendance');
const { DASHBOARD_PERIOD } = require('../constants/rabbiDashboard');
const {
  buildBucketKeys,
  formatPeriodTitle,
  formatPointLabel,
  getPeriodRange,
  toIsoDate,
} = require('../utils/dashboardPeriod');

const PRESENT_ONLY_WEIGHTS = Object.freeze({
  [ATTENDANCE_STATUS.PRESENT]: 1,
  [ATTENDANCE_STATUS.LATE]: 0,
  [ATTENDANCE_STATUS.ABSENT]: 0,
});

const WEIGHTED_ATTENDANCE_WEIGHTS = Object.freeze({
  [ATTENDANCE_STATUS.PRESENT]: 1,
  [ATTENDANCE_STATUS.LATE]: 0.5,
  [ATTENDANCE_STATUS.ABSENT]: 0,
});

function emptyCounts() {
  return {
    [ATTENDANCE_STATUS.PRESENT]: 0,
    [ATTENDANCE_STATUS.LATE]: 0,
    [ATTENDANCE_STATUS.ABSENT]: 0,
  };
}

function getAttendanceScorePercent(counts, weights = PRESENT_ONLY_WEIGHTS) {
  const present = counts[ATTENDANCE_STATUS.PRESENT];
  const late = counts[ATTENDANCE_STATUS.LATE];
  const absent = counts[ATTENDANCE_STATUS.ABSENT];
  const denominator = present + late + absent;

  if (denominator === 0) {
    return null;
  }

  const score =
    present * weights[ATTENDANCE_STATUS.PRESENT] +
    late * weights[ATTENDANCE_STATUS.LATE] +
    absent * weights[ATTENDANCE_STATUS.ABSENT];

  return Math.round((score / denominator) * 100);
}

function toPointCounts(row) {
  const counts = emptyCounts();

  counts[ATTENDANCE_STATUS.PRESENT] = Number(row?.present) || 0;
  counts[ATTENDANCE_STATUS.LATE] = Number(row?.late) || 0;
  counts[ATTENDANCE_STATUS.ABSENT] = Number(row?.absent) || 0;

  return counts;
}

function buildPoint(bucketKey, period, counts, weights) {
  const present = counts[ATTENDANCE_STATUS.PRESENT];
  const late = counts[ATTENDANCE_STATUS.LATE];
  const absent = counts[ATTENDANCE_STATUS.ABSENT];

  return {
    key: bucketKey,
    label: formatPointLabel(bucketKey, period),
    percentage: getAttendanceScorePercent(counts, weights),
    present,
    late,
    absent,
    counted: present + late + absent,
  };
}

async function getAttendanceTrend({ activityType, period, studentIds, weights = PRESENT_ONLY_WEIGHTS } = {}) {
  const timeZone = getCronTimezone();
  const selectedPeriod = period || DASHBOARD_PERIOD.WEEK;
  const { from, to } = getPeriodRange(selectedPeriod, timeZone);
  const groupFormat = selectedPeriod === DASHBOARD_PERIOD.YEAR ? '%Y-%m' : '%Y-%m-%d';
  const match = {
    activityType,
    date: { $gte: from, $lte: to },
    status: {
      $in: [ATTENDANCE_STATUS.PRESENT, ATTENDANCE_STATUS.LATE, ATTENDANCE_STATUS.ABSENT],
    },
  };

  if (Array.isArray(studentIds)) {
    match.studentId = { $in: studentIds };
  }

  const groupedRows =
    Array.isArray(studentIds) && studentIds.length === 0
      ? []
      : await Attendance.aggregate([
          { $match: match },
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
    return buildPoint(bucketKey, selectedPeriod, counts, weights);
  });

  return {
    period: selectedPeriod,
    from: toIsoDate(from),
    to: toIsoDate(to),
    title: formatPeriodTitle(selectedPeriod, from),
    averagePercent: getAttendanceScorePercent(totals, weights),
    points,
  };
}

module.exports = {
  PRESENT_ONLY_WEIGHTS,
  WEIGHTED_ATTENDANCE_WEIGHTS,
  getAttendanceScorePercent,
  getAttendanceTrend,
  getPeriodRange,
};
