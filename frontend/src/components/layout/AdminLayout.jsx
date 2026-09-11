'use client';

import AppShell from '@/components/layout/AppShell';
import { getVisibleAdminNavItems } from '@/lib/admin/nav';
import { ADMIN_ROLES } from '@/lib/auth/constants';
import { useSession } from '@/lib/auth/session';

export default function AdminLayout({ children }) {
  const role = useSession()?.user?.role;

  return (
    <AppShell
      allowedRoles={[...ADMIN_ROLES]}
      navItems={getVisibleAdminNavItems(role)}
      profileHref="/admin/profile"
    >
      {children}
    </AppShell>
  );
}
