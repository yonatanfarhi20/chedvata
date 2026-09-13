import Modal from '@/components/ui/Modal';

export default function LessonAttendanceSummaryModal({
  open,
  presentCount = 0,
  absentCount = 0,
  lateCount = 0,
  isSubmitting = false,
  onBack,
  onSave,
}) {
  return (
    <Modal
      open={open}
      closeLabel="חזרה"
      confirmLabel={isSubmitting ? 'שומר...' : 'שמירה'}
      confirmDisabled={isSubmitting}
      onClose={onBack}
      onConfirm={onSave}
    >
      {`${presentCount} נוכחים, ${absentCount} נעדרים, ${lateCount} איחר`}
    </Modal>
  );
}
