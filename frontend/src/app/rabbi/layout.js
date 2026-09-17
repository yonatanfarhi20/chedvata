import AppShell from '@/components/layout/AppShell';
import { USER_ROLE } from '@/lib/auth/constants';
import { RABBI_NAV_ITEMS } from '@/lib/nav';

export const metadata = {
  title: 'אזור רב | ישיבת חדוותא',
};

export default function RabbiLayout({ children }) {
  return (
    <AppShell
      allowedRoles={[USER_ROLE.RABBI]}
      navItems={RABBI_NAV_ITEMS}
      profileHref="/rabbi/profile"
    >
      {children}
    </AppShell>
  );
}
