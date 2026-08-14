import AuthLogo from '@/components/auth/AuthLogo';
import ForgotPasswordPanel from '@/components/auth/ForgotPasswordPanel';
import AuthCard from '@/components/ui/AuthCard';

export const metadata = {
  title: 'שכחתי סיסמא | ישיבת חדוותא',
};

export default function ForgotPasswordPage() {
  return (
    <AuthCard>
      <AuthLogo />
      <ForgotPasswordPanel />
    </AuthCard>
  );
}
