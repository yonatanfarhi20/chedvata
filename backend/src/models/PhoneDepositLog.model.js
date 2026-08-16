const mongoose = require('mongoose');
const { normalizeToUtcDate } = require('../utils/time');

const phoneDepositLogSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student is required'],
    },
    date: {
      type: Date,
      required: [true, 'Deposit date is required'],
      set: normalizeToUtcDate,
    },
    isDeposited: {
      type: Boolean,
      default: false,
    },
    depositTime: {
      type: Date,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

phoneDepositLogSchema.index({ studentId: 1, date: 1 }, { unique: true });
phoneDepositLogSchema.index({ date: 1, isDeposited: 1 });

const PhoneDepositLog = mongoose.model('PhoneDepositLog', phoneDepositLogSchema);

module.exports = PhoneDepositLog;
