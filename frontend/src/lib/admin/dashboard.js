export const KPI_TONE = Object.freeze({
  SUCCESS: 'success',
  WARNING: 'warning',
  DANGER: 'danger',
  NEUTRAL: 'neutral',
});

export const KPI_ICON = Object.freeze({
  PRESENT: 'present',
  LATE: 'late',
  PHONES: 'phones',
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

function getPhonesTone({ missing, isPastDeadline }) {
  if (missing <= 0) {
    return KPI_TONE.SUCCESS;
  }

  return isPastDeadline ? KPI_TONE.DANGER : KPI_TONE.WARNING;
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

export function getDashboardKpiCards(overview) {
  const attendance = overview?.attendance || {};
  const phones = overview?.phones || {};
  const leaves = overview?.leaves || {};

  const present = toCount(attendance.present);
  const late = toCount(attendance.late);
  const presentPercent = attendance.presentPercent;
  const deposited = toCount(phones.deposited);
  const missing = toCount(phones.missing);
  const total = toCount(phones.total);
  const leaveCount = toCount(leaves.count);
  const isPastDeadline = Boolean(phones.isPastDeadline);

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
      id: 'phones',
      title: 'הפקדת טלפונים',
      value: total > 0 ? `${deposited}/${total}` : String(deposited),
      hint: missing > 0 ? `${missing} טרם הפקידו` : 'כל הטלפונים הופקדו',
      tone: getPhonesTone({ missing, isPastDeadline }),
      icon: KPI_ICON.PHONES,
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
