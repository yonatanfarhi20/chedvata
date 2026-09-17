import Modal from '@/components/ui/Modal';

export default function PrayerAttendanceSummaryModal({
  open,
  presentCount = 0,
  absentCount = 0,
  lateCount = 0,
  onLeaveCount = 0,
  isSubmitting = false,
  onBack,
  onSave,
}) {
  const leaveNote = onLeaveCount > 0 ? ` (מתוכם ${onLeaveCount} בחופשה, ללא סנקציות)` : '';

  return (
    <Modal
      open={open}
      closeLabel="חזרה"
      confirmLabel={isSubmitting ? 'שומר...' : 'שמירה'}
      confirmDisabled={isSubmitting}
      onClose={onBack}
      onConfirm={onSave}
    >
      {`סיכום נוכחות: ${presentCount} נוכחים, ${absentCount} נעדרים${leaveNote}, ${lateCount} מאחרים`}
    </Modal>
  );
}
