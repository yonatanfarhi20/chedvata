import AuthLogo from '@/components/auth/AuthLogo';
import ResetPasswordPanel from '@/components/auth/ResetPasswordPanel';
import AuthCard from '@/components/ui/AuthCard';

export const metadata = {
  title: 'סיסמה חדשה | ישיבת חדוותא',
};

export default async function ResetPasswordPage({ params }) {
  const { token } = await params;

  return (
    <AuthCard>
      <AuthLogo />
      <ResetPasswordPanel token={token} />
    </AuthCard>
  );
}
