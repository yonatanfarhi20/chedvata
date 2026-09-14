import { apiRequest } from '@/lib/api/client';

export function getMyVacationRequests() {
  return apiRequest('/api/vacations/my-requests');
}

export function requestVacation(payload) {
  return apiRequest('/api/vacations/request', {
    method: 'POST',
    body: payload,
  });
}
