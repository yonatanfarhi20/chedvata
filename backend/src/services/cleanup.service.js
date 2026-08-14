const User = require('../models/User');
const { sendEmail } = require('./email.service');
const { getCutoffDate } = require('../utils/time');

async function cleanupExpiredUsers({ status, ttlMs, buildEmail }) {
  const users = await User.find({
    status,
    createdAt: { $lte: getCutoffDate(ttlMs) },
  });

  for (const user of users) {
    await sendEmail({
      to: user.email,
      ...buildEmail({ firstName: user.firstName }),
    });

    await User.deleteOne({
      _id: user._id,
      status,
    });
  }

  return users.length;
}

module.exports = {
  cleanupExpiredUsers,
};
