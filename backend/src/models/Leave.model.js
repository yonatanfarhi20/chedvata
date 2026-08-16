const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student is required'],
    },
    startDate: {
      type: Date,
      required: [true, 'Leave start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'Leave end date is required'],
    },
    reason: {
      type: String,
      trim: true,
    },
    addedByAdmin: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

leaveSchema.pre('validate', function ensureValidDateRange() {
  if (this.startDate && this.endDate && this.endDate < this.startDate) {
    this.invalidate('endDate', 'End date must be on or after start date');
  }
});

leaveSchema.index({ studentId: 1, startDate: 1, endDate: 1 });
leaveSchema.index({ startDate: 1, endDate: 1 });

const Leave = mongoose.model('Leave', leaveSchema);

module.exports = Leave;
