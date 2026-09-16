import { ChevronDownIcon } from '@/components/admin/users/UserTableIcons';
import { USER_STATUS_LABELS, getUserFullName } from '@/lib/admin/users';
import { USER_STATUS } from '@/lib/auth/constants';

function getStatusStyles(status) {
  if (status === USER_STATUS.ACTIVE) {
    return 'bg-success/10 text-success';
  }

  if (status === USER_STATUS.PENDING_ADMIN_APPROVAL) {
    return 'bg-amber-100 text-amber-800';
  }

  return 'bg-background text-muted';
}

export default function UserStatusBadge({
  user,
  interactive = false,
  disabled = false,
  onClick,
}) {
  const status = user?.status;
  const label = USER_STATUS_LABELS[status] || status || '—';
  const className = `inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusStyles(
    status,
  )}`;

  if (!interactive) {
    return <span className={className}>{label}</span>;
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onClick?.(user)}
      aria-label={`עדכון סטטוס של ${getUserFullName(user)}`}
      className={`${className} transition-colors hover:ring-2 hover:ring-amber-300 disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {label}
      <ChevronDownIcon />
    </button>
  );
}
