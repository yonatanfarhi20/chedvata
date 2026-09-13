import {
  ATTENDANCE_STATUS,
  PRAYER_ATTENDANCE_STATUS_OPTIONS,
  applyExistingAttendanceRecords,
  createDefaultAttendanceList,
  summarizePrayerAttendance,
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
  applyExistingAttendanceRecords,
  createDefaultAttendanceList,
};
