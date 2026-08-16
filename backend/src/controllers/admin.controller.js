const adminService = require('../services/admin.service');
const AppError = require('../utils/AppError');
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

async function listUsers(_req, res) {
  const users = await adminService.listUsers();

  return res.status(200).json({ users });
}

async function createUser(req, res) {
  const user = await adminService.createUser(req.body);

  return res.status(201).json({
    message: ERROR_MESSAGES.USER_CREATED,
    user,
  });
}

async function updateUser(req, res) {
  const user = await adminService.updateUser(req.params.id, req.body);

  return res.status(200).json({
    message: ERROR_MESSAGES.USER_UPDATED,
    user,
  });
}

async function deleteUser(req, res) {
  if (req.query.confirm !== 'true') {
    throw new AppError(ERROR_MESSAGES.DELETE_NOT_CONFIRMED, 400);
  }

  await adminService.deleteUser(req.params.id, { actorId: req.user?._id });

  return res.status(200).json({
    message: ERROR_MESSAGES.USER_DELETED,
  });
}

module.exports = {
  listPendingUsers,
  approveUser,
  rejectUser,
  listUsers,
  createUser,
  updateUser,
  deleteUser,
};
