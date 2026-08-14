import { apiRequest } from '@/lib/api/client';

export function registerUser(payload) {
  return apiRequest('/api/auth/register', {
    method: 'POST',
    body: payload,
  });
}

export function loginUser(payload) {
  return apiRequest('/api/auth/login', {
    method: 'POST',
    body: payload,
  });
}
