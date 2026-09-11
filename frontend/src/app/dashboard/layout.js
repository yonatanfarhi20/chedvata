import AppShell from '@/components/layout/AppShell';
import { USER_ROLE } from '@/lib/auth/constants';
import { STUDENT_NAV_ITEMS } from '@/lib/nav';

export const metadata = {
  title: 'אזור אישי | ישיבת חדוותא',
};

export default function StudentLayout({ children }) {
  return (
    <AppShell allowedRoles={[USER_ROLE.STUDENT]} navItems={STUDENT_NAV_ITEMS}>
      {children}
    </AppShell>
  );
}
