import AuthLogo from '@/components/auth/AuthLogo';
import LoginPanel from '@/components/auth/LoginPanel';
import AuthCard from '@/components/ui/AuthCard';

export const metadata = {
  title: 'התחברות | ישיבת חדוותא',
};

export default function LoginPage() {
  return (
    <AuthCard>
      <AuthLogo />
      <LoginPanel />
    </AuthCard>
  );
}
