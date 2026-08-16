export const ADMIN_NAV_ITEMS = Object.freeze([
  { href: '/admin', label: 'דאשבורד', icon: 'dashboard' },
  { href: '/admin/users', label: 'ניהול משתמשים', icon: 'users' },
  { href: '/admin/attendance', label: 'ניהול נוכחות', icon: 'attendance' },
  { href: '/admin/phones', label: 'הפקדת טלפונים', icon: 'phones' },
  { href: '/admin/leaves', label: 'חופשות', icon: 'leaves' },
  { href: '/admin/messages', label: 'הודעות', icon: 'messages' },
]);

export function isAdminNavActive(pathname, href) {
  if (href === '/admin') {
    return pathname === '/admin';
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
