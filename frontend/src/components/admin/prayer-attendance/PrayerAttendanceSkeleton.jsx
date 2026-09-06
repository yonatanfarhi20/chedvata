'use client';

import RequireAuth from '@/components/auth/RequireAuth';
import { SENIOR_MANAGEMENT_ROLES } from '@/lib/auth/constants';

export default function PrayerAttendanceSkeleton() {
  return (
    <RequireAuth allowedRoles={[...SENIOR_MANAGEMENT_ROLES]}>
      <section className="p-6 md:p-8">
        <h1 className="text-center text-xl font-semibold text-foreground">נוכחות תפילה</h1>
      </section>
    </RequireAuth>
  );
}
