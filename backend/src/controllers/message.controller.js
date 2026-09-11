const messageService = require('../services/message.service');
const { ERROR_MESSAGES } = require('../constants/errors');

async function listMessages(req, res) {
  const messages = await messageService.listMessages(req.user);

  return res.status(200).json({ messages });
}

async function createMessage(req, res) {
  const sentMessage = await messageService.createMessage(req.body, req.user);

  return res.status(201).json({
    message: ERROR_MESSAGES.MESSAGE_SENT,
    sentMessage,
  });
}

module.exports = {
  listMessages,
  createMessage,
};
