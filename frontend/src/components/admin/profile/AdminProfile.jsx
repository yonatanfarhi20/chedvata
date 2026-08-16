import PersonalDetailsCard from '@/components/admin/profile/PersonalDetailsCard';
import SecuritySettingsCard from '@/components/admin/profile/SecuritySettingsCard';

export default function AdminProfile() {
  return (
    <div className="mx-auto max-w-2xl p-6 md:p-8">
      <header>
        <h1 className="text-xl font-semibold text-foreground">עריכת פרופיל</h1>
        <p className="mt-1 text-sm text-muted">פרטים אישיים והגדרות אבטחה לחשבון המנהל</p>
      </header>

      <div className="mt-6 flex flex-col gap-6">
        <PersonalDetailsCard />
        <SecuritySettingsCard />
      </div>
    </div>
  );
}
