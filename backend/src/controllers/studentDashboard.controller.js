const studentDashboardService = require('../services/studentDashboard.service');

async function getStudentDashboard(req, res) {
  const overview = await studentDashboardService.getStudentDashboard(req.user);

  return res.status(200).json(overview);
}

module.exports = {
  getStudentDashboard,
};
