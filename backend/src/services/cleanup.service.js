const User = require('../models/User');
const { sendEmail } = require('./email.service');
const { getCutoffDate } = require('../utils/time');

async function cleanupExpiredUsers({ status, ttlMs, buildEmail, reason }) {
  const logReason = reason || status;
  let deletedCount = 0;
  let failedCount = 0;

  let users = [];

  try {
    users = await User.find({
      status,
      createdAt: { $lte: getCutoffDate(ttlMs) },
    });
  } catch (error) {
    console.error(`[cleanup] failed to load users (${logReason})`, error);
    return { deletedCount, failedCount };
  }

  for (const user of users) {
    try {
      await sendEmail({
        to: user.email,
        ...buildEmail({ firstName: user.firstName }),
      });

      const result = await User.deleteOne({
        _id: user._id,
        status,
      });

      if (result.deletedCount > 0) {
        deletedCount += 1;
      }
    } catch (error) {
      failedCount += 1;
      console.error(`[cleanup] failed to process user ${user.email} (${logReason})`, error);
    }
  }

  console.log(`[cleanup] deleted ${deletedCount} users (${logReason})`);

  if (failedCount > 0) {
    console.error(`[cleanup] failed to process ${failedCount} users (${logReason})`);
  }

  return { deletedCount, failedCount };
}

module.exports = {
  cleanupExpiredUsers,
};
