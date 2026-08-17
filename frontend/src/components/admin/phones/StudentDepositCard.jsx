import { formatClassAffiliation, getUserFullName } from '@/lib/admin/users';

function DepositToggle({ checked, disabled, onToggle }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={checked ? 'הופקד' : 'לא הופקד'}
      disabled={disabled}
      dir="ltr"
      onClick={onToggle}
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60 ${
        checked ? 'bg-success' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

export default function StudentDepositCard({ student, disabled = false, onToggle }) {
  const isDeposited = Boolean(student?.isDeposited);

  return (
    <article className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="min-w-0">
        <p className="truncate font-semibold text-foreground">{getUserFullName(student)}</p>
        <p className="mt-1 truncate text-sm text-muted">{formatClassAffiliation(student?.classId)}</p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span className={`text-xs font-medium ${isDeposited ? 'text-success' : 'text-muted'}`}>
          {isDeposited ? 'הופקד' : 'לא הופקד'}
        </span>
        <DepositToggle
          checked={isDeposited}
          disabled={disabled}
          onToggle={() => onToggle?.(student)}
        />
      </div>
    </article>
  );
}
