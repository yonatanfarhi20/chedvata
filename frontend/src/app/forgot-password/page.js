import Link from 'next/link';
import AuthLogo from '@/components/auth/AuthLogo';
import AuthCard from '@/components/ui/AuthCard';

export const metadata = {
  title: 'שכחתי סיסמא | ישיבת חדוותא',
};

export default function ForgotPasswordPage() {
  return (
    <AuthCard>
      <AuthLogo />
      <h1 className="mb-6 text-center text-xl font-semibold text-foreground">
        שכחתי סיסמא
      </h1>
      <p className="text-center text-sm text-muted">
        <Link href="/login" className="font-medium text-primary underline underline-offset-4">
          חזור להתחברות
        </Link>
      </p>
    </AuthCard>
  );
}
