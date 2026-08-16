function hasElapsed(fromDate, ttlMs) {
  return Date.now() - new Date(fromDate).getTime() >= ttlMs;
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
};
