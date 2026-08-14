const CRON_EXPRESSIONS = Object.freeze({
  EVERY_HOUR: '0 * * * *',
  EVERY_MIDNIGHT: '0 0 * * *',
});

const CRON_JOB_NAMES = Object.freeze({
  CLEANUP_EXPIRED_EMAIL_VERIFICATIONS: 'cleanup-expired-email-verifications',
  CLEANUP_EXPIRED_ADMIN_APPROVALS: 'cleanup-expired-admin-approvals',
});

module.exports = {
  CRON_EXPRESSIONS,
  CRON_JOB_NAMES,
};
