const rabbiDashboardService = require('../services/rabbiDashboard.service');
const { parseRabbiDashboardQuery } = require('../validators/rabbiDashboard');

async function getRabbiDashboard(req, res) {
  const query = parseRabbiDashboardQuery(req.query);
  const overview = await rabbiDashboardService.getRabbiDashboard(req.user, query);

  return res.status(200).json(overview);
}

module.exports = {
  getRabbiDashboard,
};
