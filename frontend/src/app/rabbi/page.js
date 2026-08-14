import RequireAuth from '@/components/auth/RequireAuth';
import DashboardHome from '@/components/dashboard/DashboardHome';
import { USER_ROLE } from '@/lib/auth/constants';

export const metadata = {
  title: 'אזור רב | ישיבת חדוותא',
};

export default function RabbiDashboardPage() {
  return (
    <RequireAuth allowedRoles={[USER_ROLE.RABBI]}>
      <DashboardHome title="אזור רב כיתה" />
    </RequireAuth>
  );
}
