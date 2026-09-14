const vacationService = require('../services/vacation.service');
const { ERROR_MESSAGES } = require('../constants/errors');

async function requestVacation(req, res) {
  const vacation = await vacationService.requestVacation(req.body, {
    studentId: req.user?._id,
  });

  return res.status(201).json({
    message: ERROR_MESSAGES.VACATION_REQUESTED,
    vacation,
  });
}

async function getMyRequests(req, res) {
  const result = await vacationService.getMyVacationRequests(req.user?._id);

  return res.status(200).json(result);
}

async function listAll(req, res) {
  const result = await vacationService.listAllVacations();

  return res.status(200).json(result);
}

async function updateStatus(req, res) {
  const vacation = await vacationService.updateVacationStatus(req.params.id, req.body, {
    actorId: req.user?._id,
  });

  return res.status(200).json({
    message: ERROR_MESSAGES.VACATION_STATUS_UPDATED,
    vacation,
  });
}

async function adminCreate(req, res) {
  const vacation = await vacationService.adminCreateVacation(req.body, {
    actorId: req.user?._id,
  });

  return res.status(201).json({
    message: ERROR_MESSAGES.VACATION_CREATED,
    vacation,
  });
}

module.exports = {
  requestVacation,
  getMyRequests,
  listAll,
  updateStatus,
  adminCreate,
};
