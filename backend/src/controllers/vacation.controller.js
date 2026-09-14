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

module.exports = {
  requestVacation,
  getMyRequests,
};
