const dashboardService = require('../services/dashboard.service');

async function getDashboard(_req, res) {
  const overview = await dashboardService.getDashboardOverview();

  return res.status(200).json(overview);
}

module.exports = {
  getDashboard,
};
