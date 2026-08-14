import RequireAuth from '@/components/auth/RequireAuth';
import DashboardHome from '@/components/dashboard/DashboardHome';
import { SENIOR_MANAGEMENT_ROLES } from '@/lib/auth/constants';

export const metadata = {
  title: 'הנהלה | ישיבת חדוותא',
};

export default function AdminDashboardPage() {
  return (
    <RequireAuth allowedRoles={[...SENIOR_MANAGEMENT_ROLES]}>
      <DashboardHome title="אזור הנהלה" />
    </RequireAuth>
  );
}
