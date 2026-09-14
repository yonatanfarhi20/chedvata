export const VACATION_STATUS = Object.freeze({
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
});

export const VACATION_TAB = Object.freeze({
  PENDING: 'pending',
  UPCOMING: 'upcoming',
  HISTORY: 'history',
});

export const VACATION_STATUS_LABELS = Object.freeze({
  [VACATION_STATUS.PENDING]: 'ממתינה',
  [VACATION_STATUS.APPROVED]: 'מאושרת',
  [VACATION_STATUS.REJECTED]: 'נדחתה',
});

function toCount(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toUtcDate(value) {
  if (!value) {
    return null;
  }

  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T00:00:00.000Z`);
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function getTodayDateInputValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTomorrowDateInputValue(date = new Date()) {
  const tomorrow = new Date(date);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return getTodayDateInputValue(tomorrow);
}

export function countInclusiveDays(startDate, endDate) {
  const start = toUtcDate(startDate);
  const end = toUtcDate(endDate);

  if (!start || !end || end < start) {
    return 0;
  }

  return Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1;
}

export function formatVacationDate(dateValue) {
  const parsed = toUtcDate(dateValue);

  if (!parsed) {
    return '—';
  }

  return parsed.toLocaleDateString('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function getVacationStats(data) {
  const stats = data?.stats || {};

  return {
    year: stats.year || null,
    annualQuota: toCount(stats.annualQuota),
    usedDays: toCount(stats.usedDays),
    remainingDays: toCount(stats.remainingDays),
  };
}

export function getVacationList(data) {
  return Array.isArray(data?.vacations) ? data.vacations : [];
}

export function getVacationId(vacation) {
  return vacation?._id ? String(vacation._id) : '';
}

export function isUpcomingApproved(vacation, today = new Date()) {
  if (vacation?.status !== VACATION_STATUS.APPROVED) {
    return false;
  }

  const start = toUtcDate(vacation.startDate);
  const todayUtc = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  return Boolean(start && start >= todayUtc);
}

export function isHistoryVacation(vacation, today = new Date()) {
  if (vacation?.status === VACATION_STATUS.REJECTED) {
    return true;
  }

  if (vacation?.status !== VACATION_STATUS.APPROVED) {
    return false;
  }

  const start = toUtcDate(vacation.startDate);
  const todayUtc = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  return Boolean(start && start < todayUtc);
}

export function filterVacationsByTab(vacations, tab) {
  const list = Array.isArray(vacations) ? vacations : [];

  if (tab === VACATION_TAB.PENDING) {
    return list.filter((vacation) => vacation.status === VACATION_STATUS.PENDING);
  }

  if (tab === VACATION_TAB.UPCOMING) {
    return list.filter((vacation) => isUpcomingApproved(vacation));
  }

  return list.filter((vacation) => isHistoryVacation(vacation));
}

export function hasOverlappingVacation(vacations, startDate, endDate) {
  const start = toUtcDate(startDate);
  const end = toUtcDate(endDate);

  if (!start || !end) {
    return false;
  }

  return (Array.isArray(vacations) ? vacations : []).some((vacation) => {
    if (
      vacation?.status !== VACATION_STATUS.PENDING &&
      vacation?.status !== VACATION_STATUS.APPROVED
    ) {
      return false;
    }

    const existingStart = toUtcDate(vacation.startDate);
    const existingEnd = toUtcDate(vacation.endDate);

    if (!existingStart || !existingEnd) {
      return false;
    }

    return existingStart <= end && existingEnd >= start;
  });
}

export function validateVacationRequest({ startDate, endDate, remainingDays, vacations = [] }) {
  const errors = {};
  const minDate = getTomorrowDateInputValue();

  if (!startDate) {
    errors.startDate = 'שדה זה הוא חובה';
  } else if (startDate < minDate) {
    errors.startDate = 'ניתן לבקש חופשה רק החל ממחר';
  }

  if (!endDate) {
    errors.endDate = 'שדה זה הוא חובה';
  } else if (startDate && endDate < startDate) {
    errors.endDate = 'תאריך הסיום חייב להיות באותו יום או אחרי תאריך ההתחלה';
  } else if (endDate < minDate) {
    errors.endDate = 'ניתן לבקש חופשה רק החל ממחר';
  }

  const requestedDays = countInclusiveDays(startDate, endDate);

  if (!errors.startDate && !errors.endDate && requestedDays > remainingDays) {
    errors.quota = `הבקשה חורגת מהיתרה. נותרו ${remainingDays} ימים, והבקשה כוללת ${requestedDays} ימים.`;
  }

  if (!errors.startDate && !errors.endDate && hasOverlappingVacation(vacations, startDate, endDate)) {
    errors.overlap = 'כבר קיימת חופשה באחד מהתאריכים שנבחרו';
  }

  return {
    errors,
    requestedDays,
    exceedsQuota: Boolean(errors.quota),
    hasOverlap: Boolean(errors.overlap),
    isBlocked: Boolean(errors.startDate || errors.endDate || errors.quota || errors.overlap),
  };
}
