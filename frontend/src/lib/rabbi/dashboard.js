export const DASHBOARD_PERIOD = Object.freeze({
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year',
});

export const DASHBOARD_PERIOD_OPTIONS = Object.freeze([
  { value: DASHBOARD_PERIOD.WEEK, label: 'שבוע' },
  { value: DASHBOARD_PERIOD.MONTH, label: 'חודש' },
  { value: DASHBOARD_PERIOD.YEAR, label: 'שנה' },
]);

export const EMPTY_CLASS_ATTENDANCE = Object.freeze({
  period: DASHBOARD_PERIOD.WEEK,
  from: null,
  to: null,
  title: '',
  classId: null,
  studentCount: 0,
  averagePercent: null,
  points: [],
});

function toCount(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toPercent(value) {
  if (value == null || value === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function getClassAttendanceOverview(data) {
  const overview = data && typeof data === 'object' ? data : {};
  const period = Object.values(DASHBOARD_PERIOD).includes(overview.period)
    ? overview.period
    : DASHBOARD_PERIOD.WEEK;

  return {
    period,
    from: overview.from || null,
    to: overview.to || null,
    title: typeof overview.title === 'string' ? overview.title : '',
    classId: overview.classId || null,
    studentCount: toCount(overview.studentCount),
    averagePercent: toPercent(overview.averagePercent),
    points: Array.isArray(overview.points) ? overview.points : [],
  };
}

export function formatAttendancePercent(value) {
  const percent = toPercent(value);
  return percent == null ? '—' : `${percent}%`;
}

export function getChartPoints(points) {
  return (Array.isArray(points) ? points : []).map((point) => ({
    key: point.key,
    label: point.label || point.key,
    percentage: toPercent(point.percentage),
    present: toCount(point.present),
    late: toCount(point.late),
    absent: toCount(point.absent),
    counted: toCount(point.counted),
  }));
}
