import { apiRequest } from '@/lib/api/client';

export function getMyVacationRequests() {
  return apiRequest('/api/vacations/my-requests');
}
