import { formatClassAffiliation, getUserFullName } from '@/lib/admin/users';

function WarningIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0 text-red-600"
      aria-hidden="true"
    >
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  );
}

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
  const isAlertRequired = Boolean(student?.isAlertRequired);

  return (
    <article
      className={`flex items-center justify-between gap-3 rounded-xl p-4 shadow-sm transition-colors ${
        isAlertRequired
          ? 'border-2 border-red-500 bg-red-50'
          : 'border border-border bg-card'
      }`}
    >
      <div className="min-w-0">
        <p className="flex items-center gap-2 font-semibold text-foreground">
          {isAlertRequired ? <WarningIcon /> : null}
          <span className="truncate">{getUserFullName(student)}</span>
        </p>
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
