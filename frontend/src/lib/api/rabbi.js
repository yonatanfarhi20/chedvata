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

export function getRabbiDashboard(period) {
  const params = new URLSearchParams();

  if (period) {
    params.set('period', period);
  }

  const query = params.toString();
  return apiRequest(`/api/rabbi/dashboard${query ? `?${query}` : ''}`);
}

