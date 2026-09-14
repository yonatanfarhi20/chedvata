import { apiRequest } from '@/lib/api/client';

export function getStudentDashboard() {
  return apiRequest('/api/student/dashboard');
}
