import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import { getUserFullName } from '@/lib/admin/users';

function WarningIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mx-auto mb-3 h-12 w-12 text-error"
      aria-hidden="true"
    >
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
      <path d="M10.3 4.7 2.6 18a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 4.7a2 2 0 0 0-3.4 0Z" />
    </svg>
  );
}

export default function DeleteConfirmationModal({
  user,
  onClose,
  onConfirm,
  isConfirming = false,
  error = '',
}) {
  const fullName = user ? getUserFullName(user) : '';

  return (
    <Modal
      open={Boolean(user)}
      title="מחיקת משתמש"
      closeLabel="ביטול"
      confirmLabel={
        isConfirming ? (
          <span className="inline-flex items-center justify-center gap-2">
            <Spinner />
            מוחק...
          </span>
        ) : (
          'מחק משתמש'
        )
      }
      confirmVariant="danger"
      confirmDisabled={isConfirming}
      onClose={onClose}
      onConfirm={onConfirm}
    >
      <WarningIcon />
      <p>
        האם אתה בטוח שברצונך למחוק את <strong>{fullName}</strong> מהמערכת?
      </p>
      <p className="mt-2 text-muted">פעולה זו אינה ניתנת לביטול.</p>
      {error ? <p className="mt-3 font-medium text-error">{error}</p> : null}
    </Modal>
  );
}
