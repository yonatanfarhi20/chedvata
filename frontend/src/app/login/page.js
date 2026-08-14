import Link from 'next/link';
import AuthLogo from '@/components/auth/AuthLogo';
import AuthCard from '@/components/ui/AuthCard';

export const metadata = {
  title: 'התחברות | ישיבת חדוותא',
};

export default function LoginPage() {
  return (
    <AuthCard>
      <AuthLogo />
      <h1 className="mb-6 text-center text-xl font-semibold text-foreground">
        התחברות
      </h1>
      <p className="text-center text-sm text-muted">
        עדיין לא רשום?{' '}
        <Link
          href="/register"
          className="font-medium text-primary underline underline-offset-4"
        >
          לחץ כאן להרשמה
        </Link>
      </p>
    </AuthCard>
  );
}
