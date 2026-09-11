'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SIDEBAR_ICONS } from '@/components/layout/SidebarIcons';
import { isNavItemActive } from '@/lib/nav';

export default function SidebarNavItem({ href, label, icon, onNavigate }) {
  const pathname = usePathname();
  const active = isNavItemActive(pathname, href);
  const Icon = SIDEBAR_ICONS[icon];

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
        active
          ? 'border-s-4 border-white bg-white/15 text-white'
          : 'border-s-4 border-transparent text-white/80 hover:bg-white/10 hover:text-white'
      }`}
    >
      {Icon ? <Icon /> : null}
      <span>{label}</span>
    </Link>
  );
}
