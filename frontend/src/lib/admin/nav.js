import { SENIOR_MANAGEMENT_ROLES } from '@/lib/auth/constants';
import { isNavItemActive } from '@/lib/nav';

export const ADMIN_NAV_ITEMS = Object.freeze([
  { href: '/admin', label: 'דאשבורד', icon: 'dashboard' },
  { href: '/admin/users', label: 'ניהול משתמשים', icon: 'users' },
  {
    href: '/admin/prayer-attendance',
    label: 'נוכחות תפילה',
    icon: 'prayer',
    roles: SENIOR_MANAGEMENT_ROLES,
  },
  {
    href: '/admin/phone-penalties',
    label: 'ניהול הפקדות',
    icon: 'phonePenalties',
    roles: SENIOR_MANAGEMENT_ROLES,
  },
  {
    href: '/admin/leaves',
    label: 'חופשות',
    icon: 'leaves',
    roles: SENIOR_MANAGEMENT_ROLES,
  },
  { href: '/admin/messages', label: 'הודעות', icon: 'messages' },
]);

export function getVisibleAdminNavItems(role) {
  return ADMIN_NAV_ITEMS.filter((item) => !item.roles?.length || item.roles.includes(role));
}

export function isAdminNavActive(pathname, href) {
  return isNavItemActive(pathname, href);
}
