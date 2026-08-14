'use client';

import { useState } from 'react';
import Link from 'next/link';
import RegisterForm from '@/components/auth/RegisterForm';
import RegisterSuccess from '@/components/auth/RegisterSuccess';

export default function RegisterPanel() {
  const [registeredEmail, setRegisteredEmail] = useState('');

  if (registeredEmail) {
    return <RegisterSuccess email={registeredEmail} />;
  }

  return (
    <>
      <h1 className="mb-6 text-center text-xl font-semibold text-foreground">
        הרשמת תלמידים
      </h1>
      <RegisterForm onSuccess={setRegisteredEmail} />
      <p className="mt-6 text-center text-sm text-muted">
        כבר רשום?{' '}
        <Link href="/login" className="font-medium text-primary underline underline-offset-4">
          חזור להתחברות
        </Link>
      </p>
    </>
  );
}
