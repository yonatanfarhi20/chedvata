import Link from 'next/link';
import AuthLogo from '@/components/auth/AuthLogo';
import RegisterForm from '@/components/auth/RegisterForm';
import AuthCard from '@/components/ui/AuthCard';

export const metadata = {
  title: 'הרשמה | ישיבת חדוותא',
};

export default function RegisterPage() {
  return (
    <AuthCard>
      <AuthLogo />
      <h1 className="mb-6 text-center text-xl font-semibold text-foreground">
        הרשמת תלמידים
      </h1>
      <RegisterForm />
      <p className="mt-6 text-center text-sm text-muted">
        כבר רשום?{' '}
        <Link href="/login" className="font-medium text-primary underline underline-offset-4">
          חזור להתחברות
        </Link>
      </p>
    </AuthCard>
  );
}
