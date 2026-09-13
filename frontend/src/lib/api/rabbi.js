import { apiRequest } from '@/lib/api/client';

export function getRabbiClassStudents() {
  return apiRequest('/api/admin/lesson-attendance/students');
}

export function getRabbiLessonAttendanceToday() {
  return apiRequest('/api/admin/lesson-attendance/today');
}

export function saveRabbiLessonAttendance(payload) {
  return apiRequest('/api/admin/lesson-attendance', {
    method: 'POST',
    body: payload,
  });
}
