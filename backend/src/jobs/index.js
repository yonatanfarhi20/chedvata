const {
  registerCleanupExpiredEmailVerificationsJob,
} = require('./cleanupExpiredEmailVerifications');
const {
  registerCleanupExpiredAdminApprovalsJob,
} = require('./cleanupExpiredAdminApprovals');
const { getScheduledJobs } = require('./scheduler');

function startJobs() {
  registerCleanupExpiredEmailVerificationsJob();
  registerCleanupExpiredAdminApprovalsJob();

  const jobNames = [...getScheduledJobs().keys()].join(', ');
  console.log(`Cron jobs started: ${jobNames}`);
}

module.exports = {
  startJobs,
};
