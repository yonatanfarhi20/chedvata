import AuthLogo from '@/components/auth/AuthLogo';
import RegisterPanel from '@/components/auth/RegisterPanel';
import AuthCard from '@/components/ui/AuthCard';

export const metadata = {
  title: 'הרשמה | ישיבת חדוותא',
};

export default function RegisterPage() {
  return (
    <AuthCard>
      <AuthLogo />
      <RegisterPanel />
    </AuthCard>
  );
}
