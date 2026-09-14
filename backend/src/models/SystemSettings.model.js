const mongoose = require('mongoose');
const { DEFAULT_VACATION_DAYS, SYSTEM_SETTINGS_KEY } = require('../constants/vacations');

const systemSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: SYSTEM_SETTINGS_KEY,
    },
    defaultVacationDays: {
      type: Number,
      required: [true, 'Default vacation days are required'],
      min: [0, 'Default vacation days cannot be negative'],
      default: DEFAULT_VACATION_DAYS,
    },
  },
  {
    timestamps: true,
  },
);

const SystemSettings = mongoose.model('SystemSettings', systemSettingsSchema);

module.exports = SystemSettings;
