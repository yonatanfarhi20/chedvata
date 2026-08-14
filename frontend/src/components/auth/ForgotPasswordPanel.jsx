import Link from 'next/link';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

export default function ForgotPasswordPanel() {
  return (
    <>
      <h1 className="mb-6 text-center text-xl font-semibold text-foreground">
        שכחתי סיסמא
      </h1>
      <ForgotPasswordForm />
      <p className="mt-6 text-center text-sm text-muted">
        <Link href="/login" className="font-medium text-primary underline underline-offset-4">
          חזור להתחברות
        </Link>
      </p>
    </>
  );
}
