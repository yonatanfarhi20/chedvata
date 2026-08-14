function hasElapsed(fromDate, ttlMs) {
  return Date.now() - new Date(fromDate).getTime() >= ttlMs;
}

function getExpiryDate(ttlMs) {
  return new Date(Date.now() + ttlMs);
}

module.exports = {
  hasElapsed,
  getExpiryDate,
};
