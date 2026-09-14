const VACATION_STATUS = Object.freeze({
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
});

const DEFAULT_VACATION_DAYS = 11;
const SYSTEM_SETTINGS_KEY = 'global';
const VACATION_QUOTA_EXCEEDED_CODE = 'VACATION_QUOTA_EXCEEDED';
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const VACATION_NOTIFICATION_SUBJECT = 'עדכון על חופשה';

function formatVacationDate(date) {
  return new Date(date).toLocaleDateString('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function buildVacationNotificationContent({ startDate, endDate, reason, status } = {}) {
  const start = formatVacationDate(startDate);
  const end = formatVacationDate(endDate);
  const trimmedReason = typeof reason === 'string' ? reason.trim() : '';
  const lines = [];

  if (status === VACATION_STATUS.APPROVED) {
    lines.push(`אושרה לך חופשה בתאריכים ${start} עד ${end}.`);
  } else {
    lines.push(`נוספה לך חופשה יזומה בתאריכים ${start} עד ${end}.`);
  }

  if (trimmedReason) {
    lines.push(`סיבה: ${trimmedReason}`);
  }

  return lines.join('\n');
}

module.exports = {
  VACATION_STATUS,
  DEFAULT_VACATION_DAYS,
  SYSTEM_SETTINGS_KEY,
  VACATION_QUOTA_EXCEEDED_CODE,
  MS_PER_DAY,
  VACATION_NOTIFICATION_SUBJECT,
  formatVacationDate,
  buildVacationNotificationContent,
};
