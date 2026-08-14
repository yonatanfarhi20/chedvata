const {
  registerCleanupExpiredEmailVerificationsJob,
} = require('./cleanupExpiredEmailVerifications');

function startJobs() {
  registerCleanupExpiredEmailVerificationsJob();
}

module.exports = {
  startJobs,
};
