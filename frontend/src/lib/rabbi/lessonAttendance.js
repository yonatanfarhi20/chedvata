import {
  ATTENDANCE_STATUS,
  ON_LEAVE_BADGE_LABEL,
  PRAYER_ATTENDANCE_STATUS_OPTIONS,
  applyExistingAttendanceRecords,
  createDefaultAttendanceList,
  summarizePrayerAttendance,
  toStudentIdSet,
} from '@/lib/admin/attendance';

export const LESSON_ATTENDANCE_STATUS_OPTIONS = PRAYER_ATTENDANCE_STATUS_OPTIONS;

export function buildLessonAttendancePayload(attendanceList) {
  return {
    records: attendanceList.map((item) => ({
      studentId: item.studentId,
      status: item.status || ATTENDANCE_STATUS.PRESENT,
    })),
  };
}

export const summarizeLessonAttendance = summarizePrayerAttendance;

export {
  ATTENDANCE_STATUS,
  ON_LEAVE_BADGE_LABEL,
  applyExistingAttendanceRecords,
  createDefaultAttendanceList,
  toStudentIdSet,
};
