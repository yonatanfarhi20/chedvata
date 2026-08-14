'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LoginForm from '@/components/auth/LoginForm';
import { getDashboardPath } from '@/lib/auth/constants';
import { useSession } from '@/lib/auth/session';

export default function LoginPanel() {
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    if (session) {
      router.replace(getDashboardPath(session.user.role));
    }
  }, [router, session]);

  if (session) {
    return null;
  }

  return (
    <>
      <h1 className="mb-6 text-center text-xl font-semibold text-foreground">
        התחברות
      </h1>
      <LoginForm />
      <p className="mt-6 text-center text-sm text-muted">
        עדיין לא רשום?{' '}
        <Link href="/register" className="font-medium text-primary underline underline-offset-4">
          לחץ כאן להרשמה
        </Link>
      </p>
    </>
  );
}
