const messageService = require('../services/message.service');
const { ERROR_MESSAGES } = require('../constants/errors');

async function createMessage(req, res) {
  const sentMessage = await messageService.createMessage(req.body, {
    senderId: req.user?._id,
  });

  return res.status(201).json({
    message: ERROR_MESSAGES.MESSAGE_SENT,
    sentMessage,
  });
}

module.exports = {
  createMessage,
};
