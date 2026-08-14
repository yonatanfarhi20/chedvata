const authService = require('../services/auth.service');
const { ERROR_MESSAGES } = require('../constants/errors');

async function register(req, res) {
  const user = await authService.register(req.body);

  return res.status(201).json({
    message: ERROR_MESSAGES.REGISTER_SUCCESS,
    user,
  });
}

async function verifyEmail(req, res) {
  const user = await authService.verifyEmail(req.params.token);

  return res.status(200).json({
    message: ERROR_MESSAGES.EMAIL_VERIFIED,
    user,
  });
}

async function login(req, res) {
  const { user, token } = await authService.login(req.body);

  return res.status(200).json({
    message: ERROR_MESSAGES.LOGIN_SUCCESS,
    token,
    user,
  });
}

async function forgotPassword(req, res) {
  await authService.forgotPassword(req.body);

  return res.status(200).json({
    message: ERROR_MESSAGES.FORGOT_PASSWORD_SUCCESS,
  });
}

module.exports = {
  register,
  verifyEmail,
  login,
  forgotPassword,
};
