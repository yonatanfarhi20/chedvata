const phoneService = require('../services/phone.service');
const { ERROR_MESSAGES } = require('../constants/errors');

async function getDailyStatus(_req, res) {
  const result = await phoneService.getDailyStatus();

  return res.status(200).json(result);
}

async function toggleDeposit(req, res) {
  const result = await phoneService.toggleDeposit(req.body, {
    reportedBy: req.user?._id,
  });

  return res.status(200).json({
    message: ERROR_MESSAGES.PHONE_DEPOSIT_UPDATED,
    ...result,
  });
}

module.exports = {
  getDailyStatus,
  toggleDeposit,
};
