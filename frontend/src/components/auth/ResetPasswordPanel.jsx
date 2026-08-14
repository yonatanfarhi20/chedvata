import Link from 'next/link';
import Alert from '@/components/ui/Alert';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

export default function ResetPasswordPanel({ token }) {
  return (
    <>
      <h1 className="mb-6 text-center text-xl font-semibold text-foreground">
        סיסמה חדשה
      </h1>
      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <Alert>קישור האיפוס אינו תקין</Alert>
      )}
      <p className="mt-6 text-center text-sm text-muted">
        <Link href="/login" className="font-medium text-primary underline underline-offset-4">
          חזור להתחברות
        </Link>
      </p>
    </>
  );
}
