import RequireAuth from '@/components/auth/RequireAuth';
import DashboardHome from '@/components/dashboard/DashboardHome';
import { USER_ROLE } from '@/lib/auth/constants';

export const metadata = {
  title: 'אזור אישי | ישיבת חדוותא',
};

export default function StudentDashboardPage() {
  return (
    <RequireAuth allowedRoles={[USER_ROLE.STUDENT]}>
      <DashboardHome title="אזור אישי" />
    </RequireAuth>
  );
}
