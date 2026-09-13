import Modal from '@/components/ui/Modal';

export default function LessonAttendanceExistingReportModal({ open, onBack, onContinue }) {
  return (
    <Modal
      open={open}
      closeLabel="חזרה"
      confirmLabel="המשך"
      onClose={onBack}
      onConfirm={onContinue}
    >
      בוצעה נוכחות שיעור היום
    </Modal>
  );
}
