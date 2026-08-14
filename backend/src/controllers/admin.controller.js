const adminService = require('../services/admin.service');
const { ERROR_MESSAGES } = require('../constants/errors');

async function listPendingUsers(_req, res) {
  const users = await adminService.listPendingUsers();

  return res.status(200).json({ users });
}

async function approveUser(req, res) {
  const user = await adminService.approveUser(req.params.id);

  return res.status(200).json({
    message: ERROR_MESSAGES.USER_APPROVED,
    user,
  });
}

async function rejectUser(req, res) {
  await adminService.rejectUser(req.params.id);

  return res.status(200).json({
    message: ERROR_MESSAGES.USER_REJECTED,
  });
}

module.exports = {
  listPendingUsers,
  approveUser,
  rejectUser,
};
