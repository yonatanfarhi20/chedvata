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

export function updateAdminPassword(payload) {
  return apiRequest('/api/admin/profile/password', {
    method: 'PUT',
    body: payload,
  });
}

export function getAttendance({ date, activityType }) {
  const params = new URLSearchParams({ date, activityType });
  return apiRequest(`/api/admin/attendance?${params.toString()}`);
}

export function saveAttendance(payload) {
  return apiRequest('/api/admin/attendance', {
    method: 'POST',
    body: payload,
  });
}

export function getPhoneDepositStatus() {
  return apiRequest('/api/admin/phones/status');
}

export function togglePhoneDeposit({ studentId, isDeposited }) {
  return apiRequest('/api/admin/phones/deposit', {
    method: 'POST',
    body: { studentId, isDeposited },
  });
}
