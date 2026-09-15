const AppError = require('../utils/AppError');
const { DASHBOARD_PERIOD } = require('../constants/rabbiDashboard');
const { ERROR_MESSAGES } = require('../constants/errors');

function parseRabbiDashboardQuery(query = {}) {
  const rawPeriod = typeof query.period === 'string' ? query.period.trim() : query.period;
  const period = rawPeriod == null || rawPeriod === '' ? DASHBOARD_PERIOD.WEEK : rawPeriod;

  if (!Object.values(DASHBOARD_PERIOD).includes(period)) {
    throw new AppError(ERROR_MESSAGES.INVALID_DATA, 400, {
      errors: { period: ERROR_MESSAGES.INVALID_DASHBOARD_PERIOD },
    });
  }

  return { period };
}

module.exports = {
  parseRabbiDashboardQuery,
};
