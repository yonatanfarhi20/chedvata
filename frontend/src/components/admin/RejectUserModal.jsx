import Modal from '@/components/ui/Modal';

function getFullName(user) {
  return `${user.firstName} ${user.lastName}`.trim();
}

export default function RejectUserModal({ user, onClose, onConfirm, isConfirming = false }) {
  const fullName = user ? getFullName(user) : '';

  return (
    <Modal
      open={Boolean(user)}
      title="דחיית בקשה"
      closeLabel="ביטול"
      confirmLabel={isConfirming ? 'דוחה בקשה...' : 'דחה בקשה'}
      confirmVariant="danger"
      confirmDisabled={isConfirming}
      onClose={onClose}
      onConfirm={onConfirm}
    >
      האם אתה בטוח שברצונך לדחות את בקשת ההרשמה של {fullName}? החשבון יימחק מהמערכת ולא ניתן
      לשחזר פעולה זו.
    </Modal>
  );
}
