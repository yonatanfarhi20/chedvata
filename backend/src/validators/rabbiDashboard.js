const { parseDashboardPeriodQuery } = require('./dashboardPeriod');

function parseRabbiDashboardQuery(query = {}) {
  return parseDashboardPeriodQuery(query);
}

module.exports = {
  parseRabbiDashboardQuery,
};
