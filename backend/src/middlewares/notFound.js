const { ERROR_MESSAGES } = require('../constants/errors');

function notFound(_req, res) {
  return res.status(404).json({ message: ERROR_MESSAGES.NOT_FOUND });
}

module.exports = notFound;
