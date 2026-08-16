const mongoose = require('mongoose');
const { ACTIVITY_TYPE, ATTENDANCE_STATUS } = require('../constants/attendance');
const { normalizeToUtcDate } = require('../utils/time');

const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student is required'],
    },
    date: {
      type: Date,
      required: [true, 'Attendance date is required'],
      set: normalizeToUtcDate,
    },
    activityType: {
      type: String,
      enum: {
        values: Object.values(ACTIVITY_TYPE),
        message: 'Activity type must be lesson or prayer',
      },
      required: [true, 'Activity type is required'],
    },
    status: {
      type: String,
      enum: {
        values: Object.values(ATTENDANCE_STATUS),
        message: 'Status must be present, absent, late, or on_leave',
      },
      required: [true, 'Attendance status is required'],
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

attendanceSchema.index({ studentId: 1, date: 1, activityType: 1 }, { unique: true });
attendanceSchema.index({ date: 1, activityType: 1 });

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
