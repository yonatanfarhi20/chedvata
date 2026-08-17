const { getPhoneDepositDeadline, getPhoneDepositTimezone } = require('../constants/phones');
const { getZonedDateTimeParts } = require('./time');

function isPastPhoneDepositDeadline(now = new Date()) {
  const timeZone = getPhoneDepositTimezone();
  const { hour: deadlineHour, minute: deadlineMinute } = getPhoneDepositDeadline();
  const { hour, minute } = getZonedDateTimeParts(now, timeZone);

  return hour * 60 + minute >= deadlineHour * 60 + deadlineMinute;
}

function isPhoneDepositAlertRequired(isDeposited, now = new Date()) {
  return !isDeposited && isPastPhoneDepositDeadline(now);
}

module.exports = {
  isPastPhoneDepositDeadline,
  isPhoneDepositAlertRequired,
};
