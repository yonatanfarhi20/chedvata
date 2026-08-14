const { USER_STATUS } = require('../constants/user');
const { ADMIN_APPROVAL_TTL_MS } = require('../constants/auth');
const { CRON_EXPRESSIONS, CRON_JOB_NAMES, CLEANUP_REASONS } = require('../constants/cron');
const { buildAdminApprovalExpiredEmail } = require('../templates/emails/adminApprovalExpired');
const { cleanupExpiredUsers } = require('../services/cleanup.service');
const { scheduleJob } = require('./scheduler');

async function cleanupExpiredAdminApprovals() {
  return cleanupExpiredUsers({
    status: USER_STATUS.PENDING_ADMIN_APPROVAL,
    ttlMs: ADMIN_APPROVAL_TTL_MS,
    buildEmail: buildAdminApprovalExpiredEmail,
    reason: CLEANUP_REASONS.ADMIN_APPROVAL_EXPIRED,
  });
}

function registerCleanupExpiredAdminApprovalsJob() {
  return scheduleJob({
    name: CRON_JOB_NAMES.CLEANUP_EXPIRED_ADMIN_APPROVALS,
    expression: CRON_EXPRESSIONS.EVERY_MIDNIGHT,
    task: cleanupExpiredAdminApprovals,
  });
}

module.exports = {
  cleanupExpiredAdminApprovals,
  registerCleanupExpiredAdminApprovalsJob,
};
