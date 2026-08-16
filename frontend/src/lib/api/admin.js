import { apiRequest } from '@/lib/api/client';

export function getPendingUsers() {
  return apiRequest('/api/admin/users/pending');
}

export function getUsers() {
  return apiRequest('/api/admin/users');
}

export function approveUser(userId) {
  return apiRequest(`/api/admin/users/${encodeURIComponent(userId)}/approve`, {
    method: 'PUT',
  });
}

export function rejectUser(userId) {
  return apiRequest(`/api/admin/users/${encodeURIComponent(userId)}/reject`, {
    method: 'DELETE',
  });
}
