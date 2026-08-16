import { PencilIcon, TrashIcon } from '@/components/admin/users/UserTableIcons';
import { getUserFullName } from '@/lib/admin/users';

export default function UserRowActions({ user, onEdit, onDelete, disabled = false }) {
  const fullName = getUserFullName(user);

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onEdit?.(user)}
        aria-label={`עריכת ${fullName}`}
        className="rounded-lg p-2 text-primary transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-50"
      >
        <PencilIcon />
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onDelete?.(user)}
        aria-label={`מחיקת ${fullName}`}
        className="rounded-lg p-2 text-error transition-colors hover:bg-error/10 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <TrashIcon />
      </button>
    </div>
  );
}
