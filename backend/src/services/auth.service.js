const User = require('../models/User');
const AppError = require('../utils/AppError');
const { ERROR_MESSAGES } = require('../constants/errors');
const { USER_STATUS } = require('../constants/user');
const { EMAIL_VERIFICATION_TTL_MS } = require('../constants/auth');
const { parseRegisterPayload } = require('../validators/register');
const { generateOpaqueToken, hashToken } = require('./token.service');
const { sendEmail } = require('./email.service');
const { buildVerifyAccountEmail } = require('../templates/emails/verifyAccount');
const { getApiBaseUrl } = require('../config/app');
const { hasElapsed } = require('../utils/time');

async function register(payload) {
  const data = parseRegisterPayload(payload);

  const existingUser = await User.findOne({
    $or: [{ email: data.email }, { idNumber: data.idNumber }],
  });

  if (existingUser) {
    throw new AppError(ERROR_MESSAGES.DUPLICATE_USER, 409);
  }

  const { token, hashedToken } = generateOpaqueToken();
  const user = await User.create({
    ...data,
    verificationToken: hashedToken,
  });

  const verificationUrl = `${getApiBaseUrl()}/api/auth/verify-email/${encodeURIComponent(token)}`;

  try {
    await sendEmail({
      to: user.email,
      ...buildVerifyAccountEmail({
        firstName: user.firstName,
        verificationUrl,
      }),
    });
  } catch (error) {
    await User.findByIdAndDelete(user._id);
    console.error(error);
    throw new AppError(ERROR_MESSAGES.EMAIL_SEND_FAILED, 500);
  }

  return user;
}

async function verifyEmail(rawToken) {
  const token = typeof rawToken === 'string' ? rawToken.trim() : '';

  if (!token) {
    throw new AppError(ERROR_MESSAGES.INVALID_VERIFICATION_TOKEN, 400);
  }

  const user = await User.findOne({
    verificationToken: hashToken(token),
  }).select('+verificationToken');

  if (!user) {
    throw new AppError(ERROR_MESSAGES.INVALID_VERIFICATION_TOKEN, 400);
  }

  if (user.status !== USER_STATUS.PENDING_EMAIL_VERIFICATION) {
    throw new AppError(ERROR_MESSAGES.INVALID_VERIFICATION_TOKEN, 400);
  }

  if (hasElapsed(user.createdAt, EMAIL_VERIFICATION_TTL_MS)) {
    throw new AppError(ERROR_MESSAGES.EXPIRED_VERIFICATION_TOKEN, 400);
  }

  const verifiedUser = await User.findOneAndUpdate(
    {
      _id: user._id,
      status: USER_STATUS.PENDING_EMAIL_VERIFICATION,
    },
    {
      $set: { status: USER_STATUS.PENDING_ADMIN_APPROVAL },
      $unset: { verificationToken: 1 },
    },
    { new: true },
  );

  if (!verifiedUser) {
    throw new AppError(ERROR_MESSAGES.INVALID_VERIFICATION_TOKEN, 400);
  }

  return verifiedUser;
}

module.exports = {
  register,
  verifyEmail,
};
