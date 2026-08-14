const {
  registerCleanupExpiredEmailVerificationsJob,
} = require('./cleanupExpiredEmailVerifications');
const {
  registerCleanupExpiredAdminApprovalsJob,
} = require('./cleanupExpiredAdminApprovals');

function startJobs() {
  registerCleanupExpiredEmailVerificationsJob();
  registerCleanupExpiredAdminApprovalsJob();
}

module.exports = {
  startJobs,
};
