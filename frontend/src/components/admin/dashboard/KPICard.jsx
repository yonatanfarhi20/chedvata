import { KPI_ICONS } from '@/components/admin/dashboard/KPIIcons';
import { KPI_TONE } from '@/lib/admin/dashboard';

const TONE_STYLES = {
  [KPI_TONE.SUCCESS]: {
    card: 'border-success/30',
    icon: 'bg-success/10 text-success',
    value: 'text-success',
  },
  [KPI_TONE.WARNING]: {
    card: 'border-amber-300',
    icon: 'bg-amber-50 text-amber-700',
    value: 'text-amber-700',
  },
  [KPI_TONE.DANGER]: {
    card: 'border-error/40',
    icon: 'bg-error/10 text-error',
    value: 'text-error',
  },
  [KPI_TONE.NEUTRAL]: {
    card: 'border-border',
    icon: 'bg-background text-primary',
    value: 'text-foreground',
  },
};

export default function KPICard({ title, value, icon, tone = KPI_TONE.NEUTRAL, hint }) {
  const styles = TONE_STYLES[tone] || TONE_STYLES[KPI_TONE.NEUTRAL];
  const Icon = typeof icon === 'string' ? KPI_ICONS[icon] : null;

  return (
    <article className={`rounded-2xl border bg-card p-4 shadow-sm ${styles.card}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted">{title}</p>
          <p className={`mt-2 text-3xl font-bold tabular-nums ${styles.value}`}>{value}</p>
          {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
        </div>
        <div className={`rounded-xl p-2 ${styles.icon}`}>{Icon ? <Icon /> : icon}</div>
      </div>
    </article>
  );
}
