const DASHBOARD_ALERT_TYPE = Object.freeze({
  PENDING_APPROVALS: 'pending_approvals',
  ATTENDANCE_ABSENCES: 'attendance_absences',
});

const DASHBOARD_ALERT_HREF = Object.freeze({
  [DASHBOARD_ALERT_TYPE.PENDING_APPROVALS]: '/admin/users',
  [DASHBOARD_ALERT_TYPE.ATTENDANCE_ABSENCES]: '/admin/prayer-attendance',
});

const LEAVES_PREVIEW_LIMIT = 8;

function hebrewCountLabel(count, singular, plural) {
  if (count === 1) {
    return singular;
  }

  return `${count} ${plural}`;
}

function buildPendingApprovalsMessage(count) {
  return `${hebrewCountLabel(count, 'תלמיד אחד ממתין', 'תלמידים ממתינים')} לאישור הרשמה`;
}

function buildAttendanceAbsencesMessage(count) {
  return `${hebrewCountLabel(count, 'תלמיד אחד נעדר', 'תלמידים נעדרים')} היום`;
}

module.exports = {
  DASHBOARD_ALERT_TYPE,
  DASHBOARD_ALERT_HREF,
  LEAVES_PREVIEW_LIMIT,
  buildPendingApprovalsMessage,
  buildAttendanceAbsencesMessage,
};
