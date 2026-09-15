'use client';

import ManagementDashboardSkeleton from '@/components/admin/dashboard/ManagementDashboardSkeleton';
import RequireAuth from '@/components/auth/RequireAuth';
import { SENIOR_MANAGEMENT_ROLES } from '@/lib/auth/constants';
import { useSession } from '@/lib/auth/session';

function ManagementDashboardView() {
  const user = useSession()?.user;

  return (
    <div className="flex min-h-full flex-1 bg-background p-4 md:p-8">
      <section className="mx-auto flex w-full max-w-6xl flex-col">
        <header className="mb-6">
          <h1 className="text-xl font-semibold text-foreground">לוח בקרה</h1>
          <p className="mt-1 text-sm text-muted">
            {user?.firstName
              ? `שלום ${user.firstName}, כאן מוצגת תמונת מצב כלל-ישיבתית של חופשות ונוכחות.`
              : 'תמונת מצב כלל-ישיבתית של חופשות ונוכחות.'}
          </p>
        </header>

        <ManagementDashboardSkeleton />
      </section>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <RequireAuth allowedRoles={[...SENIOR_MANAGEMENT_ROLES]}>
      <ManagementDashboardView />
    </RequireAuth>
  );
}
