const { getCronTimezone } = require('../config/cron');

const DEFAULT_PHONE_DEPOSIT_DEADLINE_HOUR = 22;
const DEFAULT_PHONE_DEPOSIT_DEADLINE_MINUTE = 0;

function parseDeadlinePart(value, fallback) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : fallback;
}

function getPhoneDepositDeadline() {
  const rawValue = process.env.PHONE_DEPOSIT_DEADLINE || '';
  const [rawHour, rawMinute] = rawValue.split(':');

  const hour = parseDeadlinePart(rawHour, DEFAULT_PHONE_DEPOSIT_DEADLINE_HOUR);
  const minute = parseDeadlinePart(rawMinute, DEFAULT_PHONE_DEPOSIT_DEADLINE_MINUTE);

  return {
    hour: hour >= 0 && hour <= 23 ? hour : DEFAULT_PHONE_DEPOSIT_DEADLINE_HOUR,
    minute: minute >= 0 && minute <= 59 ? minute : DEFAULT_PHONE_DEPOSIT_DEADLINE_MINUTE,
  };
}

function getPhoneDepositTimezone() {
  return process.env.PHONE_DEPOSIT_TIMEZONE || getCronTimezone();
}

module.exports = {
  DEFAULT_PHONE_DEPOSIT_DEADLINE_HOUR,
  DEFAULT_PHONE_DEPOSIT_DEADLINE_MINUTE,
  getPhoneDepositDeadline,
  getPhoneDepositTimezone,
};
