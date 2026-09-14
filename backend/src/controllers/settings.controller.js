const systemSettingsService = require('../services/systemSettings.service');
const { parseVacationSettingsPayload } = require('../validators/vacations');
const { ERROR_MESSAGES } = require('../constants/errors');

async function updateVacationSettings(req, res) {
  const { defaultVacationDays } = parseVacationSettingsPayload(req.body);
  const settings = await systemSettingsService.updateVacationSettings(defaultVacationDays);

  return res.status(200).json({
    message: ERROR_MESSAGES.VACATION_SETTINGS_UPDATED,
    settings: {
      defaultVacationDays: settings.defaultVacationDays,
    },
  });
}

module.exports = {
  updateVacationSettings,
};
