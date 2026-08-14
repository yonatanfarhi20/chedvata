function hasElapsed(fromDate, ttlMs) {
  return Date.now() - new Date(fromDate).getTime() >= ttlMs;
}

module.exports = {
  hasElapsed,
};
