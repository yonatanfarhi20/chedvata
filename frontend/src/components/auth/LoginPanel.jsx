import Link from 'next/link';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPanel() {
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
