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

module.exports = {
  requestVacation,
};
