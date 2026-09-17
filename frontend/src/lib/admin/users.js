import { ADMIN_ROLES, USER_ROLE, USER_STATUS } from '@/lib/auth/constants';

export const USER_ROLE_LABELS = Object.freeze({
  [USER_ROLE.STUDENT]: 'תלמיד',
  [USER_ROLE.RABBI]: 'רב',
  [USER_ROLE.MASHGIACH]: 'משגיח',
  [USER_ROLE.ROSH_YESHIVA]: 'ראש ישיבה',
});

export const USER_STATUS_LABELS = Object.freeze({
  [USER_STATUS.ACTIVE]: 'פעיל',
  [USER_STATUS.PENDING_EMAIL_VERIFICATION]: 'ממתין לאימות מייל',
  [USER_STATUS.PENDING_ADMIN_APPROVAL]: 'ממתין לאישור הנהלה',
});

export function getUserFullName(user) {
  return `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
}

export function getUserId(user) {
  return user?._id ? String(user._id) : '';
}

export function getRabbis(users = []) {
  return users
    .filter((user) => user?.role === USER_ROLE.RABBI && user?.status === USER_STATUS.ACTIVE)
    .sort((left, right) => getUserFullName(left).localeCompare(getUserFullName(right), 'he'));
}

export function getRabbiClassId(rabbi) {
  if (rabbi?.classId) {
    return String(rabbi.classId);
  }

  return getUserId(rabbi);
}

export function findRabbiByClassId(classId, rabbis = []) {
  const normalized = String(classId || '');

  if (!normalized) {
    return null;
  }

  return (
    rabbis.find((rabbi) => getUserId(rabbi) === normalized || String(rabbi.classId || '') === normalized) ||
    null
  );
}

export function getRabbiSelectValue(classId, rabbis = []) {
  const rabbi = findRabbiByClassId(classId, rabbis);
  return rabbi ? getUserId(rabbi) : String(classId || '');
}

export function resolveClassIdFromRabbiSelection(selectedRabbiId, rabbis = []) {
  const rabbiId = String(selectedRabbiId || '').trim();

  if (!rabbiId) {
    return '';
  }

  const rabbi = rabbis.find((item) => getUserId(item) === rabbiId);
  return rabbi ? getRabbiClassId(rabbi) : rabbiId;
}

export function formatClassAffiliation(classId, rabbis = []) {
  if (!classId) {
    return '—';
  }

  const rabbi = findRabbiByClassId(classId, rabbis);

  if (rabbi) {
    return getUserFullName(rabbi);
  }

  return String(classId);
}

export function matchesUserSearch(user, query) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return true;
  }

  const fullName = getUserFullName(user).toLowerCase();
  const idNumber = String(user?.idNumber || '').toLowerCase();

  return fullName.includes(normalized) || idNumber.includes(normalized);
}

export function isStudentRole(role) {
  return role === USER_ROLE.STUDENT;
}

export function isStudentUser(user) {
  return isStudentRole(user?.role);
}

export function isStaffUser(user) {
  return ADMIN_ROLES.includes(user?.role);
}

export function isPendingApprovalStatus(status) {
  return status === USER_STATUS.PENDING_ADMIN_APPROVAL;
}
