const leaveService = require('../services/leave.service');
const { ERROR_MESSAGES } = require('../constants/errors');

async function createLeave(req, res) {
  const leave = await leaveService.createLeave(req.body, {
    senderId: req.user?._id,
  });

  return res.status(201).json({
    message: ERROR_MESSAGES.LEAVE_CREATED,
    leave,
  });
}

module.exports = {
  createLeave,
};
