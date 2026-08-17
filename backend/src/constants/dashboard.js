const DASHBOARD_ALERT_TYPE = Object.freeze({
  PENDING_APPROVALS: 'pending_approvals',
  PHONE_DEPOSITS: 'phone_deposits',
  ATTENDANCE_ABSENCES: 'attendance_absences',
});

const DASHBOARD_ALERT_HREF = Object.freeze({
  [DASHBOARD_ALERT_TYPE.PENDING_APPROVALS]: '/admin/users',
  [DASHBOARD_ALERT_TYPE.PHONE_DEPOSITS]: '/admin/phones',
  [DASHBOARD_ALERT_TYPE.ATTENDANCE_ABSENCES]: '/admin/attendance',
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

function buildPhoneDepositsMessage(count) {
  return `${hebrewCountLabel(count, 'תלמיד אחד טרם הפקיד', 'תלמידים טרם הפקידו')} טלפון לאחר שעת היעד`;
}

function buildAttendanceAbsencesMessage(count) {
  return `${hebrewCountLabel(count, 'תלמיד אחד נעדר', 'תלמידים נעדרים')} היום`;
}

module.exports = {
  DASHBOARD_ALERT_TYPE,
  DASHBOARD_ALERT_HREF,
  LEAVES_PREVIEW_LIMIT,
  buildPendingApprovalsMessage,
  buildPhoneDepositsMessage,
  buildAttendanceAbsencesMessage,
};
