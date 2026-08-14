'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getDashboardPath } from '@/lib/auth/constants';
import { useSession } from '@/lib/auth/session';

export default function RequireAuth({ children, allowedRoles }) {
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    if (!session) {
      router.replace('/login');
      return;
    }

    if (allowedRoles?.length && !allowedRoles.includes(session.user.role)) {
      router.replace(getDashboardPath(session.user.role));
    }
  }, [allowedRoles, router, session]);

  if (!session) {
    return null;
  }

  if (allowedRoles?.length && !allowedRoles.includes(session.user.role)) {
    return null;
  }

  return children;
}
