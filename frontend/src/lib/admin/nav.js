import { SENIOR_MANAGEMENT_ROLES } from '@/lib/auth/constants';
import { isNavItemActive } from '@/lib/nav';

export const ADMIN_NAV_ITEMS = Object.freeze([
  { href: '/admin', label: 'דאשבורד', icon: 'dashboard' },
  { href: '/admin/users', label: 'ניהול משתמשים', icon: 'users' },
  { href: '/admin/attendance', label: 'ניהול נוכחות', icon: 'attendance' },
  {
    href: '/admin/prayer-attendance',
    label: 'נוכחות תפילה',
    icon: 'prayer',
    roles: SENIOR_MANAGEMENT_ROLES,
  },
  { href: '/admin/phones', label: 'הפקדת טלפונים', icon: 'phones' },
  { href: '/admin/leaves', label: 'חופשות', icon: 'leaves' },
  { href: '/admin/messages', label: 'הודעות', icon: 'messages' },
]);

export function getVisibleAdminNavItems(role) {
  return ADMIN_NAV_ITEMS.filter((item) => !item.roles?.length || item.roles.includes(role));
}

export function isAdminNavActive(pathname, href) {
  return isNavItemActive(pathname, href);
}
