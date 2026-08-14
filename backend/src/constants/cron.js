const CRON_EXPRESSIONS = Object.freeze({
  EVERY_HOUR: '0 * * * *',
  EVERY_MIDNIGHT: '0 0 * * *',
});

const CRON_JOB_NAMES = Object.freeze({
  CLEANUP_EXPIRED_EMAIL_VERIFICATIONS: 'cleanup-expired-email-verifications',
  CLEANUP_EXPIRED_ADMIN_APPROVALS: 'cleanup-expired-admin-approvals',
});

const CLEANUP_REASONS = Object.freeze({
  EMAIL_VERIFICATION_EXPIRED: 'email verification expired',
  ADMIN_APPROVAL_EXPIRED: 'admin approval expired',
});

module.exports = {
  CRON_EXPRESSIONS,
  CRON_JOB_NAMES,
  CLEANUP_REASONS,
};
