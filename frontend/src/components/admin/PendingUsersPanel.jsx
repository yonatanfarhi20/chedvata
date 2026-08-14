'use client';

import { useEffect, useState } from 'react';
import Alert from '@/components/ui/Alert';
import PendingUsersTable from '@/components/admin/PendingUsersTable';
import { getPendingUsers } from '@/lib/api/admin';
import { useSession } from '@/lib/auth/session';

export default function PendingUsersPanel() {
  const user = useSession()?.user;
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadPendingUsers() {
      setIsLoading(true);
      setError('');

      try {
        const data = await getPendingUsers();

        if (!cancelled) {
          setUsers(Array.isArray(data?.users) ? data.users : []);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message || 'לא ניתן לטעון את רשימת הממתינים.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadPendingUsers();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex min-h-full flex-1 bg-background p-4 md:p-8">
      <section className="mx-auto flex w-full max-w-5xl flex-col">
        <header className="mb-6">
          <p className="mb-2 text-2xl font-bold tracking-wide text-primary">ישיבת חדוותא</p>
          <h1 className="text-xl font-semibold text-foreground">בקשות הרשמה</h1>
          <p className="mt-1 text-sm text-muted">
            שלום {user?.firstName}, להלן התלמידים שאימתו את המייל וממתינים לאישור ההנהלה.
          </p>
        </header>

        {error ? <Alert>{error}</Alert> : null}

        {isLoading ? (
          <p className="text-sm text-muted">טוען בקשות...</p>
        ) : null}

        {!isLoading && !error && users.length === 0 ? (
          <p className="rounded-xl border border-border bg-card px-4 py-6 text-sm text-muted shadow-sm">
            אין כרגע בקשות הממתינות לאישור.
          </p>
        ) : null}

        {!isLoading && users.length > 0 ? <PendingUsersTable users={users} /> : null}
      </section>
    </div>
  );
}
