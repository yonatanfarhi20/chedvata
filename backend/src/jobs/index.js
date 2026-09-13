const {
  registerCleanupExpiredEmailVerificationsJob,
} = require('./cleanupExpiredEmailVerifications');
const {
  registerCleanupExpiredAdminApprovalsJob,
} = require('./cleanupExpiredAdminApprovals');
const { registerExpirePhonePenaltiesJob } = require('./expirePhonePenalties');
const { getScheduledJobs } = require('./scheduler');

function startJobs() {
  registerCleanupExpiredEmailVerificationsJob();
  registerCleanupExpiredAdminApprovalsJob();
  registerExpirePhonePenaltiesJob();

  const jobNames = [...getScheduledJobs().keys()].join(', ');
  console.log(`Cron jobs started: ${jobNames}`);
}

module.exports = {
  startJobs,
};
