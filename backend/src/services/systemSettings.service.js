const SystemSettings = require('../models/SystemSettings.model');
const { DEFAULT_VACATION_DAYS, SYSTEM_SETTINGS_KEY } = require('../constants/vacations');

async function getVacationSettings() {
  return SystemSettings.findOneAndUpdate(
    { key: SYSTEM_SETTINGS_KEY },
    {
      $setOnInsert: {
        key: SYSTEM_SETTINGS_KEY,
        defaultVacationDays: DEFAULT_VACATION_DAYS,
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    },
  );
}

async function updateVacationSettings(defaultVacationDays) {
  return SystemSettings.findOneAndUpdate(
    { key: SYSTEM_SETTINGS_KEY },
    {
      $set: { defaultVacationDays },
      $setOnInsert: { key: SYSTEM_SETTINGS_KEY },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    },
  );
}

module.exports = {
  getVacationSettings,
  updateVacationSettings,
};
