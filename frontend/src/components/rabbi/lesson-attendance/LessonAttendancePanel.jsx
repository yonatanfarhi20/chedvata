'use client';

import RequireAuth from '@/components/auth/RequireAuth';
import { USER_ROLE } from '@/lib/auth/constants';

function LessonAttendanceContent() {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-background p-4 md:p-8">
      <section className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-1 flex-col">
        <header className="mb-6 shrink-0">
          <h1 className="text-center text-xl font-semibold text-foreground">נוכחות שיעור</h1>
        </header>
      </section>
    </div>
  );
}

export default function LessonAttendancePanel() {
  return (
    <RequireAuth allowedRoles={[USER_ROLE.RABBI]}>
      <LessonAttendanceContent />
    </RequireAuth>
  );
}
