const dashboardService = require('../services/dashboard.service');
const { parseDashboardPeriodQuery } = require('../validators/dashboardPeriod');

async function getDashboard(_req, res) {
  const overview = await dashboardService.getDashboardOverview();

  return res.status(200).json(overview);
}

async function getDailyVacations(_req, res) {
  const overview = await dashboardService.getDailyVacations();

  return res.status(200).json(overview);
}

async function getPrayerAttendance(req, res) {
  const query = parseDashboardPeriodQuery(req.query);
  const overview = await dashboardService.getPrayerAttendanceTrend(query);

  return res.status(200).json(overview);
}

async function getLessonAttendance(req, res) {
  const query = parseDashboardPeriodQuery(req.query);
  const overview = await dashboardService.getLessonAttendanceTrend(query);

  return res.status(200).json(overview);
}

module.exports = {
  getDashboard,
  getDailyVacations,
  getPrayerAttendance,
  getLessonAttendance,
};
