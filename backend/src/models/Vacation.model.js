const mongoose = require('mongoose');
const { VACATION_STATUS } = require('../constants/vacations');

const vacationSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student is required'],
    },
    startDate: {
      type: Date,
      required: [true, 'Vacation start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'Vacation end date is required'],
    },
    reason: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: Object.values(VACATION_STATUS),
        message: 'Status must be Pending, Approved, or Rejected',
      },
      default: VACATION_STATUS.PENDING,
    },
    createdByAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

vacationSchema.pre('validate', function ensureValidDateRange() {
  if (this.startDate && this.endDate && this.endDate < this.startDate) {
    this.invalidate('endDate', 'End date must be on or after start date');
  }
});

vacationSchema.index({ studentId: 1, startDate: 1, endDate: 1 });
vacationSchema.index({ studentId: 1, status: 1, startDate: 1 });
vacationSchema.index({ status: 1, startDate: 1, endDate: 1 });

const Vacation = mongoose.model('Vacation', vacationSchema);

module.exports = Vacation;
