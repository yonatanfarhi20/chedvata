export const EMPTY_VACATIONS_TODAY = Object.freeze({
  date: null,
  onLeaveCount: 0,
  activeStudentCount: 0,
  percentage: null,
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
