import { apiRequest } from '@/lib/api/client';

export function getProfile() {
  return apiRequest('/api/profile');
}

export function updateProfile(payload) {
  return apiRequest('/api/profile', {
    method: 'PUT',
    body: payload,
  });
}

export function updatePassword(payload) {
  return apiRequest('/api/profile/password', {
    method: 'PUT',
    body: payload,
  });
}
