const lessonAttendanceService = require('../services/lessonAttendance.service');

async function listRabbiClassStudents(req, res) {
  const result = await lessonAttendanceService.listRabbiClassStudents(req.user);

  return res.status(200).json(result);
}

async function getRabbiLessonAttendanceToday(req, res) {
  const result = await lessonAttendanceService.getRabbiLessonAttendanceToday(req.user);

  return res.status(200).json(result);
}

module.exports = {
  getRabbiLessonAttendanceToday,
  listRabbiClassStudents,
};
