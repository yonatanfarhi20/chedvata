import { USER_ROLE, USER_STATUS } from '@/lib/auth/constants';

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

export function formatClassAffiliation(classId) {
  if (!classId) {
    return '—';
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
