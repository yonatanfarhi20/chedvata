function hasElapsed(fromDate, ttlMs) {
  return Date.now() - new Date(fromDate).getTime() >= ttlMs;
}

function getZonedDateTimeParts(date = new Date(), timeZone) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });

  const parts = Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value]),
  );

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  };
}

function getTodayUtcDate(timeZone) {
  const { year, month, day } = getZonedDateTimeParts(new Date(), timeZone);
  return new Date(Date.UTC(year, month - 1, day));
}

function normalizeToUtcDate(value) {
  if (value == null || value === '') {
    return value;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate()));
}

function getExpiryDate(ttlMs) {
  return new Date(Date.now() + ttlMs);
}

function getCutoffDate(ttlMs) {
  return new Date(Date.now() - ttlMs);
}

module.exports = {
  hasElapsed,
  getExpiryDate,
  getCutoffDate,
  normalizeToUtcDate,
  getZonedDateTimeParts,
  getTodayUtcDate,
};
