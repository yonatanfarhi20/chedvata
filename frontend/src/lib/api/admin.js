import { apiRequest } from '@/lib/api/client';

export function getPendingUsers() {
  return apiRequest('/api/admin/users/pending');
}

export function getUsers() {
  return apiRequest('/api/admin/users');
}

export function createUser(payload) {
  return apiRequest('/api/admin/users', {
    method: 'POST',
    body: payload,
  });
}

export function updateUser(userId, payload) {
  return apiRequest(`/api/admin/users/${encodeURIComponent(userId)}`, {
    method: 'PUT',
    body: payload,
  });
}

export function deleteUser(userId) {
  return apiRequest(`/api/admin/users/${encodeURIComponent(userId)}?confirm=true`, {
    method: 'DELETE',
  });
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

export function getAdminProfile() {
  return apiRequest('/api/admin/profile');
}

export function updateAdminProfile(payload) {
  return apiRequest('/api/admin/profile', {
    method: 'PUT',
    body: payload,
  });
}
