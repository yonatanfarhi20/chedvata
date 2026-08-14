const { USER_STATUS } = require('../constants/user');
const { EMAIL_VERIFICATION_TTL_MS } = require('../constants/auth');
const { CRON_EXPRESSIONS, CRON_JOB_NAMES } = require('../constants/cron');
const { buildEmailVerificationExpiredEmail } = require('../templates/emails/emailVerificationExpired');
const { cleanupExpiredUsers } = require('../services/cleanup.service');
const { scheduleJob } = require('./scheduler');

async function cleanupExpiredEmailVerifications() {
  return cleanupExpiredUsers({
    status: USER_STATUS.PENDING_EMAIL_VERIFICATION,
    ttlMs: EMAIL_VERIFICATION_TTL_MS,
    buildEmail: buildEmailVerificationExpiredEmail,
  });
}

function registerCleanupExpiredEmailVerificationsJob() {
  return scheduleJob({
    name: CRON_JOB_NAMES.CLEANUP_EXPIRED_EMAIL_VERIFICATIONS,
    expression: CRON_EXPRESSIONS.EVERY_HOUR,
    task: cleanupExpiredEmailVerifications,
  });
}

module.exports = {
  cleanupExpiredEmailVerifications,
  registerCleanupExpiredEmailVerificationsJob,
};
