const DEFAULT_CRON_TIMEZONE = 'Asia/Jerusalem';

function getCronTimezone() {
  return process.env.CRON_TIMEZONE || DEFAULT_CRON_TIMEZONE;
}

module.exports = {
  DEFAULT_CRON_TIMEZONE,
  getCronTimezone,
};
