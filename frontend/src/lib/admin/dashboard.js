export const KPI_TONE = Object.freeze({
  SUCCESS: 'success',
  WARNING: 'warning',
  DANGER: 'danger',
  NEUTRAL: 'neutral',
});

export const KPI_ICON = Object.freeze({
  PRESENT: 'present',
  LATE: 'late',
  LEAVES: 'leaves',
});

function toCount(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getAttendanceTone(presentPercent) {
  if (presentPercent == null) {
    return KPI_TONE.NEUTRAL;
  }

  if (presentPercent >= 90) {
    return KPI_TONE.SUCCESS;
  }

  if (presentPercent >= 70) {
    return KPI_TONE.WARNING;
  }

  return KPI_TONE.DANGER;
}

export function formatDashboardDate(dateValue) {
  if (!dateValue) {
    return '';
  }

  const parsed = new Date(dateValue);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return parsed.toLocaleDateString('he-IL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function getDashboardAlerts(overview) {
  return Array.isArray(overview?.alerts) ? overview.alerts : [];
}

export function getStudentsOnLeaveToday(overview) {
  const students = overview?.leaves?.students;
  return Array.isArray(students) ? students : [];
}

export function getDashboardKpiCards(overview) {
  const attendance = overview?.attendance || {};
  const leaves = overview?.leaves || {};

  const present = toCount(attendance.present);
  const late = toCount(attendance.late);
  const presentPercent = attendance.presentPercent;
  const leaveCount = toCount(leaves.count);

  return [
    {
      id: 'present',
      title: 'נוכחים היום',
      value: present,
      hint:
        presentPercent == null ? 'טרם דווחה נוכחות להיום' : `${presentPercent}% נוכחות`,
      tone: getAttendanceTone(presentPercent),
      icon: KPI_ICON.PRESENT,
    },
    {
      id: 'late',
      title: 'איחורים',
      value: late,
      hint: late > 0 ? 'דורש מעקב' : 'אין איחורים',
      tone: late > 0 ? KPI_TONE.WARNING : KPI_TONE.SUCCESS,
      icon: KPI_ICON.LATE,
    },
    {
      id: 'leaves',
      title: 'בחופשה היום',
      value: leaveCount,
      hint: leaveCount > 0 ? 'היעדרות מתוכננת' : 'אין תלמידים בחופשה',
      tone: leaveCount > 0 ? KPI_TONE.WARNING : KPI_TONE.NEUTRAL,
      icon: KPI_ICON.LEAVES,
    },
  ];
}
