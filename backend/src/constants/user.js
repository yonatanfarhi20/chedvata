const USER_STATUS = Object.freeze({
  PENDING_EMAIL_VERIFICATION: 'pending_email_verification',
  PENDING_ADMIN_APPROVAL: 'pending_admin_approval',
  ACTIVE: 'active',
});

const USER_ROLE = Object.freeze({
  STUDENT: 'student',
  RABBI: 'rabbi',
  MASHGIACH: 'mashgiach',
  ROSH_YESHIVA: 'rosh_yeshiva',
});

const SENIOR_MANAGEMENT_ROLES = Object.freeze([
  USER_ROLE.MASHGIACH,
  USER_ROLE.ROSH_YESHIVA,
]);

module.exports = {
  USER_STATUS,
  USER_ROLE,
  SENIOR_MANAGEMENT_ROLES,
};
