export const USER_ROLE = Object.freeze({
  STUDENT: 'student',
  RABBI: 'rabbi',
  MASHGIACH: 'mashgiach',
  ROSH_YESHIVA: 'rosh_yeshiva',
});

export const SENIOR_MANAGEMENT_ROLES = Object.freeze([
  USER_ROLE.MASHGIACH,
  USER_ROLE.ROSH_YESHIVA,
]);

export const USER_STATUS = Object.freeze({
  PENDING_EMAIL_VERIFICATION: 'pending_email_verification',
  PENDING_ADMIN_APPROVAL: 'pending_admin_approval',
  ACTIVE: 'active',
});

export function getDashboardPath(role) {
  if (SENIOR_MANAGEMENT_ROLES.includes(role)) {
    return '/admin';
  }

  if (role === USER_ROLE.RABBI) {
    return '/rabbi';
  }

  return '/dashboard';
}
