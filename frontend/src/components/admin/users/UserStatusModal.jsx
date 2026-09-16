import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import { USER_STATUS_LABELS, getUserFullName } from '@/lib/admin/users';

export default function UserStatusModal({
  user,
  isApproving = false,
  onClose,
  onApprove,
  onReject,
}) {
  const fullName = user ? getUserFullName(user) : '';
  const statusLabel = user ? USER_STATUS_LABELS[user.status] || user.status : '';

  return (
    <Modal
      open={Boolean(user)}
      title="עדכון סטטוס"
      closeDisabled={isApproving}
      hideActions
      onClose={onClose}
    >
      <p>
        {fullName} נמצא בסטטוס <strong>{statusLabel}</strong>. ניתן לאשר אותו במערכת או לדחות את
        הבקשה.
      </p>
      <div className="mt-6 flex flex-col gap-2">
        <Button type="button" variant="secondary" disabled={isApproving} onClick={onClose}>
          ביטול
        </Button>
        <Button type="button" variant="danger" disabled={isApproving} onClick={() => onReject?.(user)}>
          דחה בקשה
        </Button>
        <Button
          type="button"
          variant="success"
          disabled={isApproving}
          onClick={() => onApprove?.(user)}
          className="inline-flex items-center justify-center gap-2"
        >
          {isApproving ? <Spinner /> : null}
          {isApproving ? 'מאשר...' : 'אשר במערכת'}
        </Button>
      </div>
    </Modal>
  );
}
