import { DASHBOARD_PERIOD } from '@/lib/rabbi/dashboard';

export const EMPTY_VACATIONS_TODAY = Object.freeze({
  date: null,
  onLeaveCount: 0,
  activeStudentCount: 0,
  percentage: null,
});

export const EMPTY_ATTENDANCE_TREND = Object.freeze({
  period: DASHBOARD_PERIOD.WEEK,
  from: null,
  to: null,
  title: '',
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

export function getVacationsToday(data) {
  const overview = data && typeof data === 'object' ? data : {};

  return {
    date: overview.date || null,
    onLeaveCount: toCount(overview.onLeaveCount),
    activeStudentCount: toCount(overview.activeStudentCount),
    percentage: toPercent(overview.percentage),
  };
}

export function formatLeavePercentage(value) {
  const percent = toPercent(value);
  return percent == null ? '—' : `${percent}%`;
}

export function getAttendanceTrendOverview(data) {
  const overview = data && typeof data === 'object' ? data : {};
  const period = Object.values(DASHBOARD_PERIOD).includes(overview.period)
    ? overview.period
    : DASHBOARD_PERIOD.WEEK;

  return {
    period,
    from: overview.from || null,
    to: overview.to || null,
    title: typeof overview.title === 'string' ? overview.title : '',
    studentCount: toCount(overview.studentCount),
    averagePercent: toPercent(overview.averagePercent),
    points: Array.isArray(overview.points) ? overview.points : [],
  };
}
