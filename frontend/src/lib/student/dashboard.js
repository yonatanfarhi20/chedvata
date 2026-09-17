export const PRAYER_EVENT_STATUS = Object.freeze({
  LATE: 'late',
  ABSENT: 'absent',
});

export const PRAYER_EVENT_LABELS = Object.freeze({
  [PRAYER_EVENT_STATUS.LATE]: 'איחור',
  [PRAYER_EVENT_STATUS.ABSENT]: 'חיסור',
});

export const LESSON_DAY_STATUS = Object.freeze({
  PRESENT: 'present',
  LATE: 'late',
  ABSENT: 'absent',
  NONE: 'none',
});

export const LESSON_DAY_LABELS = Object.freeze({
  [LESSON_DAY_STATUS.PRESENT]: 'נוכח',
  [LESSON_DAY_STATUS.LATE]: 'איחור',
  [LESSON_DAY_STATUS.ABSENT]: 'חיסור',
  [LESSON_DAY_STATUS.NONE]: 'אין שיעור',
});

export const HEBREW_WEEKDAYS = Object.freeze(['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳']);

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

export const PHONE_DEPOSIT_STATUS = Object.freeze({
  NONE: 'none',
  PENDING_DEPOSIT: 'pending_deposit',
  DEPOSITED: 'deposited',
  READY_FOR_RETURN: 'ready_for_return',
});

export const EMPTY_DASHBOARD = Object.freeze({
  classAffiliation: {
    classId: null,
    rabbiName: '',
    label: 'טרם שויכת לשיעור',
    isAssigned: false,
  },
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
    phoneDepositStatus: PHONE_DEPOSIT_STATUS.NONE,
    remainingDays: 0,
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

export function getClassAffiliationOverview(data) {
  const affiliation = data?.classAffiliation || {};
  const rabbi = affiliation.rabbi || {};
  const rabbiName = `${rabbi.firstName || ''} ${rabbi.lastName || ''}`.trim();

  if (!rabbiName) {
    return EMPTY_DASHBOARD.classAffiliation;
  }

  return {
    classId: affiliation.classId ? String(affiliation.classId) : null,
    rabbiName,
    label: `השיעור של הרב ${rabbiName}`,
    isAssigned: true,
  };
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
  const maxAbsences = toCount(prayers.maxAbsences) || EMPTY_DASHBOARD.prayers.maxAbsences;
  const activeAbsences = toCount(prayers.activeAbsences);
  const phoneDepositStatus = Object.values(PHONE_DEPOSIT_STATUS).includes(prayers.phoneDepositStatus)
    ? prayers.phoneDepositStatus
    : EMPTY_DASHBOARD.prayers.phoneDepositStatus;

  return {
    activeAbsences,
    maxAbsences,
    events: Array.isArray(prayers.events) ? prayers.events : [],
    phoneDepositStatus:
      phoneDepositStatus === PHONE_DEPOSIT_STATUS.NONE && activeAbsences >= maxAbsences
        ? PHONE_DEPOSIT_STATUS.PENDING_DEPOSIT
        : phoneDepositStatus,
    remainingDays: toCount(prayers.remainingDays),
  };
}

export function getPhoneDepositNotice({
  phoneDepositStatus,
  remainingDays,
} = EMPTY_DASHBOARD.prayers) {
  if (phoneDepositStatus === PHONE_DEPOSIT_STATUS.PENDING_DEPOSIT) {
    return {
      tone: PRAYER_DANGER_TONE.DANGER,
      message: 'יש להפקיד את הטלפון. הגעת לחמש חיסורים פעילים בתפילה.',
    };
  }

  if (phoneDepositStatus === PHONE_DEPOSIT_STATUS.DEPOSITED) {
    const days = toCount(remainingDays);

    if (days <= 0) {
      return {
        tone: PRAYER_DANGER_TONE.WARNING,
        message: 'הטלפון בהפקדה. תקופת ההמתנה הסתיימה וניתן לקבל אותו חזרה.',
      };
    }

    return {
      tone: PRAYER_DANGER_TONE.WARNING,
      message:
        days === 1
          ? 'הטלפון בהפקדה. נותר יום אחד עד לקבלה חזרה.'
          : `הטלפון בהפקדה. נותרו ${days} ימים עד לקבלה חזרה.`,
    };
  }

  if (phoneDepositStatus === PHONE_DEPOSIT_STATUS.READY_FOR_RETURN) {
    return {
      tone: PRAYER_DANGER_TONE.SAFE,
      message: 'תקופת ההפקדה הסתיימה. ניתן לקבל את הטלפון חזרה.',
    };
  }

  return null;
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

export function formatDashboardDate(dateValue) {
  if (!dateValue) {
    return '—';
  }

  const isoDate = typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)
    ? `${dateValue}T00:00:00.000Z`
    : dateValue;
  const parsed = new Date(isoDate);

  if (Number.isNaN(parsed.getTime())) {
    return '—';
  }

  return parsed.toLocaleDateString('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function getRemainingDaysLabel(remainingDays) {
  const days = Number(remainingDays) || 0;

  if (days === 1) {
    return 'נותר יום אחד למחיקה';
  }

  return `נותרו ${days} ימים למחיקה`;
}

export function getLessonOverview(data) {
  const lessons = data?.lessons || {};

  return {
    year: lessons.year || null,
    month: lessons.month || null,
    days: Array.isArray(lessons.days) ? lessons.days : [],
  };
}

export function formatLessonMonthTitle(year, month) {
  if (!year || !month) {
    return 'החודש הנוכחי';
  }

  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString('he-IL', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function buildLessonCalendarCells(year, month, days) {
  if (!year || !month) {
    return [];
  }

  const daysByDate = new Map((Array.isArray(days) ? days : []).map((day) => [day.date, day]));
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells = Array.from({ length: firstWeekday }, () => null);

  for (let day = 1; day <= lastDay; day += 1) {
    const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    cells.push(
      daysByDate.get(date) || {
        date,
        day,
        weekday: new Date(Date.UTC(year, month - 1, day)).getUTCDay(),
        status: LESSON_DAY_STATUS.NONE,
        reason: 'no_lesson',
      },
    );
  }

  return cells;
}
