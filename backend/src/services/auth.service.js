const User = require('../models/User');
const AppError = require('../utils/AppError');
const { ERROR_MESSAGES } = require('../constants/errors');
const { parseRegisterPayload } = require('../validators/register');
const { generateOpaqueToken } = require('./token.service');

async function register(payload) {
  const data = parseRegisterPayload(payload);

  const existingUser = await User.findOne({
    $or: [{ email: data.email }, { idNumber: data.idNumber }],
  });

  if (existingUser) {
    throw new AppError(ERROR_MESSAGES.DUPLICATE_USER, 409);
  }

  const { hashedToken } = generateOpaqueToken();
  const user = await User.create({
    ...data,
    verificationToken: hashedToken,
  });

  return user;
}

module.exports = {
  register,
};
