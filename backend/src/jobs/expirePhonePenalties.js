const { CRON_EXPRESSIONS, CRON_JOB_NAMES } = require('../constants/cron');
const { runDailyPhonePenaltyMaintenance } = require('../services/phonePenalty.service');
const { scheduleJob } = require('./scheduler');

async function expirePhonePenalties() {
  return runDailyPhonePenaltyMaintenance();
}

function registerExpirePhonePenaltiesJob() {
  return scheduleJob({
    name: CRON_JOB_NAMES.EXPIRE_PHONE_PENALTIES,
    expression: CRON_EXPRESSIONS.EVERY_MIDNIGHT,
    task: expirePhonePenalties,
  });
}

module.exports = {
  expirePhonePenalties,
  registerExpirePhonePenaltiesJob,
};
