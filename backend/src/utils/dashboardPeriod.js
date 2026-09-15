const { getTodayUtcDate, getZonedDateTimeParts, normalizeToUtcDate } = require('./time');
const { DASHBOARD_PERIOD, HEBREW_WEEKDAYS } = require('../constants/rabbiDashboard');

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

module.exports = {
  toIsoDate,
  getPeriodRange,
  buildBucketKeys,
  formatPointLabel,
  formatPeriodTitle,
};
