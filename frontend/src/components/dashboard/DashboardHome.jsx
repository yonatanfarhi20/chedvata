'use client';

import { useSession } from '@/lib/auth/session';

export default function DashboardHome({ title }) {
  const user = useSession()?.user;

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-background p-6">
      <section className="w-full max-w-md rounded-2xl bg-card px-8 py-10 text-center shadow-xl">
        <p className="mb-4 text-2xl font-bold tracking-wide text-primary">ישיבת חדוותא</p>
        <h1 className="mb-3 text-xl font-semibold text-foreground">{title}</h1>
        <p className="text-sm text-muted">שלום {user?.firstName}, ההתחברות בוצעה בהצלחה.</p>
      </section>
    </div>
  );
}
