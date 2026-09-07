import Modal from '@/components/ui/Modal';

export default function PrayerAttendanceEditAlertModal({ open, onBack, onContinue }) {
  return (
    <Modal
      open={open}
      closeLabel="חזור"
      confirmLabel="המשך"
      onClose={onBack}
      onConfirm={onContinue}
    >
      כבר הוזנה נוכחות תפילה להיום. האם ברצונך לצפות ולערוך?
    </Modal>
  );
}
