const phonePenaltyAdminService = require('../services/phonePenaltyAdmin.service');
const { parseStudentIdParam } = require('../validators/phonePenalties');
const { ERROR_MESSAGES } = require('../constants/errors');

async function listPhonePenaltyQueues(_req, res) {
  const result = await phonePenaltyAdminService.listPhonePenaltyQueues();

  return res.status(200).json(result);
}

async function confirmPhoneDeposit(req, res) {
  const studentId = parseStudentIdParam(req.params.studentId);
  const student = await phonePenaltyAdminService.confirmPhoneDeposit(studentId);

  return res.status(200).json({
    message: ERROR_MESSAGES.PHONE_DEPOSIT_CONFIRMED,
    student,
  });
}

async function confirmPhoneReturn(req, res) {
  const studentId = parseStudentIdParam(req.params.studentId);
  const student = await phonePenaltyAdminService.confirmPhoneReturn(studentId);

  return res.status(200).json({
    message: ERROR_MESSAGES.PHONE_RETURN_CONFIRMED,
    student,
  });
}

module.exports = {
  confirmPhoneDeposit,
  confirmPhoneReturn,
  listPhonePenaltyQueues,
};
