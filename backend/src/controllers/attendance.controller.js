const attendanceService = require('../services/attendance.service');
const { ERROR_MESSAGES } = require('../constants/errors');

async function listAttendance(req, res) {
  const result = await attendanceService.listAttendance(req.query);

  return res.status(200).json(result);
}

async function saveAttendance(req, res) {
  const result = await attendanceService.saveAttendance(req.body, {
    reportedBy: req.user?._id,
  });

  return res.status(200).json({
    message: ERROR_MESSAGES.ATTENDANCE_SAVED,
    ...result,
  });
}

module.exports = {
  listAttendance,
  saveAttendance,
};
