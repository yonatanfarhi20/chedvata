const authService = require('../services/auth.service');
const { ERROR_MESSAGES } = require('../constants/errors');

async function register(req, res) {
  const user = await authService.register(req.body);

  return res.status(201).json({
    message: ERROR_MESSAGES.REGISTER_SUCCESS,
    user,
  });
}

module.exports = {
  register,
};