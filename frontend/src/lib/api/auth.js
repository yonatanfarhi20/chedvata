import { apiRequest } from '@/lib/api/client';

export function registerUser(payload) {
  return apiRequest('/api/auth/register', {
    method: 'POST',
    body: payload,
  });
}
