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

export function requestPasswordReset(payload) {
  return apiRequest('/api/auth/forgot-password', {
    method: 'POST',
    body: payload,
  });
}

export function resetPassword(token, payload) {
  return apiRequest(`/api/auth/reset-password/${encodeURIComponent(token)}`, {
    method: 'POST',
    body: payload,
  });
}
