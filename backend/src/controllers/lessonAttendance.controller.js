const lessonAttendanceService = require('../services/lessonAttendance.service');
const { ERROR_MESSAGES } = require('../constants/errors');

async function listRabbiClassStudents(req, res) {
  const result = await lessonAttendanceService.listRabbiClassStudents(req.user);

  return res.status(200).json(result);
}

async function getRabbiLessonAttendanceToday(req, res) {
  const result = await lessonAttendanceService.getRabbiLessonAttendanceToday(req.user);

  return res.status(200).json(result);
}

async function saveRabbiLessonAttendance(req, res) {
  const result = await lessonAttendanceService.saveRabbiLessonAttendance(req.user, req.body);

  return res.status(200).json({
    message: ERROR_MESSAGES.LESSON_ATTENDANCE_SAVED,
    ...result,
  });
}

module.exports = {
  getRabbiLessonAttendanceToday,
  listRabbiClassStudents,
  saveRabbiLessonAttendance,
};
