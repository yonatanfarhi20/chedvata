export const RABBI_NAV_ITEMS = Object.freeze([
  { href: '/rabbi', label: 'דאשבורד', icon: 'dashboard' },
  { href: '/rabbi/attendance', label: 'נוכחות שיעור', icon: 'attendance' },
  { href: '/rabbi/messages', label: 'הודעות', icon: 'messages' },
]);

export const STUDENT_NAV_ITEMS = Object.freeze([
  { href: '/dashboard', label: 'דאשבורד', icon: 'dashboard' },
  { href: '/dashboard/vacations', label: 'בקשת חופשה', icon: 'leaves' },
  { href: '/dashboard/messages', label: 'הודעות', icon: 'messages' },
]);

export function isNavItemActive(pathname, href) {
  if (!pathname || !href) {
    return false;
  }

  const isSectionRoot = href.split('/').filter(Boolean).length === 1;

  if (isSectionRoot) {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
