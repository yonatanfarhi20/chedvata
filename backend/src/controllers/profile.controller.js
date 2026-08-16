const profileService = require('../services/profile.service');
const { ERROR_MESSAGES } = require('../constants/errors');

async function getProfile(req, res) {
  const user = await profileService.getProfile(req.user);

  return res.status(200).json({ user });
}

async function updateProfile(req, res) {
  const user = await profileService.updateProfile(req.user, req.body);

  return res.status(200).json({
    message: ERROR_MESSAGES.PROFILE_UPDATED,
    user,
  });
}

async function updatePassword(req, res) {
  await profileService.updatePassword(req.user, req.body);

  return res.status(200).json({
    message: ERROR_MESSAGES.PASSWORD_CHANGED,
  });
}

module.exports = {
  getProfile,
  updateProfile,
  updatePassword,
};
