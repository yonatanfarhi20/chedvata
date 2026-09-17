const User = require('../models/User');
const { ACTIVITY_TYPE } = require('../constants/attendance');
const { DASHBOARD_PERIOD } = require('../constants/rabbiDashboard');
const {
  WEIGHTED_ATTENDANCE_WEIGHTS,
  getAttendanceScorePercent,
  getAttendanceTrend,
  getPeriodRange,
} = require('./attendanceTrend.service');
const {
  buildRabbiClassStudentFilter,
  resolveRabbiClassId,
} = require('./lessonAttendance.service');

async function getRabbiDashboard(actor, { period } = {}) {
  const selectedPeriod = period || DASHBOARD_PERIOD.WEEK;
  const classId = resolveRabbiClassId(actor);
  const students = await User.find(buildRabbiClassStudentFilter(actor)).select('_id');
  const studentIds = students.map((student) => student._id);
  const trend = await getAttendanceTrend({
    activityType: ACTIVITY_TYPE.LESSON,
    period: selectedPeriod,
    studentIds,
    weights: WEIGHTED_ATTENDANCE_WEIGHTS,
  });

  return {
    ...trend,
    classId: String(classId),
    studentCount: studentIds.length,
  };
}

module.exports = {
  getPeriodRange,
  getAttendanceScorePercent: (counts) =>
    getAttendanceScorePercent(counts, WEIGHTED_ATTENDANCE_WEIGHTS),
  getRabbiDashboard,
};
