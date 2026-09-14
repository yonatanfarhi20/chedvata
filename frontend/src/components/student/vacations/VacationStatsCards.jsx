import KPICard from '@/components/admin/dashboard/KPICard';
import { KPI_TONE } from '@/lib/admin/dashboard';

export default function VacationStatsCards({ stats }) {
  const cards = [
    {
      id: 'quota',
      title: 'מכסה שנתית',
      value: stats.annualQuota,
      hint: stats.year ? `לשנת ${stats.year}` : 'ימי חופשה לשנה הנוכחית',
      tone: KPI_TONE.NEUTRAL,
      icon: 'leaves',
    },
    {
      id: 'used',
      title: 'ימים שנוצלו',
      value: stats.usedDays,
      hint: stats.usedDays > 0 ? 'ימים שאושרו השנה' : 'טרם נוצלו ימים',
      tone: stats.usedDays > 0 ? KPI_TONE.WARNING : KPI_TONE.SUCCESS,
      icon: 'leaves',
    },
    {
      id: 'remaining',
      title: 'ימים שנותרו',
      value: stats.remainingDays,
      hint: stats.remainingDays > 0 ? 'ניתן להגיש בקשה במסגרת היתרה' : 'אין יתרה זמינה',
      tone: stats.remainingDays > 0 ? KPI_TONE.SUCCESS : KPI_TONE.DANGER,
      icon: 'leaves',
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-3" aria-label="סטטיסטיקת חופשות">
      {cards.map((card) => (
        <KPICard
          key={card.id}
          title={card.title}
          value={card.value}
          hint={card.hint}
          tone={card.tone}
          icon={card.icon}
        />
      ))}
    </section>
  );
}
