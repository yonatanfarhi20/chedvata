import { DASHBOARD_PERIOD_OPTIONS } from '@/lib/rabbi/dashboard';

export default function PeriodToggle({ value, onChange, disabled = false }) {
  return (
    <div
      role="radiogroup"
      aria-label="טווח תצוגת הנוכחות"
      className="inline-flex rounded-xl border border-border bg-background p-1"
    >
      {DASHBOARD_PERIOD_OPTIONS.map((option) => {
        const isSelected = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
              isSelected ? 'bg-primary text-white' : 'text-muted hover:bg-card hover:text-foreground'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
