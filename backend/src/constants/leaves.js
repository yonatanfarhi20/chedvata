const LEAVE_NOTIFICATION_SUBJECT = 'עדכון על חופשה יזומה';

function formatLeaveDate(date) {
  return new Date(date).toLocaleDateString('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function buildLeaveNotificationContent({ startDate, endDate, reason } = {}) {
  const start = formatLeaveDate(startDate);
  const end = formatLeaveDate(endDate);
  const lines = [`נוספה לך חופשה יזומה בתאריכים ${start} עד ${end}.`];
  const trimmedReason = typeof reason === 'string' ? reason.trim() : '';

  if (trimmedReason) {
    lines.push(`סיבה: ${trimmedReason}`);
  }

  return lines.join('\n');
}

module.exports = {
  LEAVE_NOTIFICATION_SUBJECT,
  formatLeaveDate,
  buildLeaveNotificationContent,
};
