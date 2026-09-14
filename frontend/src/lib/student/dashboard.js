export const PRAYER_EVENT_STATUS = Object.freeze({
  LATE: 'late',
  ABSENT: 'absent',
});

export const LESSON_DAY_STATUS = Object.freeze({
  PRESENT: 'present',
  LATE: 'late',
  ABSENT: 'absent',
  NONE: 'none',
});

export const VACATION_USAGE_TONE = Object.freeze({
  SAFE: 'safe',
  WARNING: 'warning',
  DANGER: 'danger',
});

export const PRAYER_DANGER_TONE = Object.freeze({
  SAFE: 'safe',
  WARNING: 'warning',
  DANGER: 'danger',
});

export const EMPTY_DASHBOARD = Object.freeze({
  vacations: {
    year: null,
    annualQuota: 0,
    usedDays: 0,
    remainingDays: 0,
  },
  prayers: {
    activeAbsences: 0,
    maxAbsences: 5,
    events: [],
  },
  lessons: {
    year: null,
    month: null,
    days: [],
  },
});

function toCount(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function getVacationOverview(data) {
  const stats = data?.vacations || {};

  return {
    year: stats.year || null,
    annualQuota: toCount(stats.annualQuota),
    usedDays: toCount(stats.usedDays),
    remainingDays: toCount(stats.remainingDays),
  };
}

export function getVacationUsageRatio({ usedDays, annualQuota }) {
  if (!annualQuota || annualQuota <= 0) {
    return 0;
  }

  return Math.min(1, Math.max(0, usedDays / annualQuota));
}

export function getVacationUsageTone({ usedDays, annualQuota }) {
  const usage = getVacationUsageRatio({ usedDays, annualQuota });

  if (usage >= 0.8) {
    return VACATION_USAGE_TONE.DANGER;
  }

  if (usage >= 0.5) {
    return VACATION_USAGE_TONE.WARNING;
  }

  return VACATION_USAGE_TONE.SAFE;
}

export function getPrayerOverview(data) {
  const prayers = data?.prayers || {};

  return {
    activeAbsences: toCount(prayers.activeAbsences),
    maxAbsences: toCount(prayers.maxAbsences) || EMPTY_DASHBOARD.prayers.maxAbsences,
    events: Array.isArray(prayers.events) ? prayers.events : [],
  };
}

export function getPrayerDangerTone(activeAbsences) {
  const absences = toCount(activeAbsences);

  if (absences >= 4) {
    return PRAYER_DANGER_TONE.DANGER;
  }

  if (absences >= 2) {
    return PRAYER_DANGER_TONE.WARNING;
  }

  return PRAYER_DANGER_TONE.SAFE;
}

export function getLessonOverview(data) {
  const lessons = data?.lessons || {};

  return {
    year: lessons.year || null,
    month: lessons.month || null,
    days: Array.isArray(lessons.days) ? lessons.days : [],
  };
}
