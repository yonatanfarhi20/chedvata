import { apiRequest } from '@/lib/api/client';

export function getDashboard() {
  return apiRequest('/api/admin/dashboard');
}

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

export function getPhonePenaltyQueues() {
  return apiRequest('/api/admin/phone-penalties');
}

export function confirmPhonePenaltyDeposit(studentId) {
  return apiRequest(`/api/admin/phone-penalties/${encodeURIComponent(studentId)}/deposit`, {
    method: 'POST',
  });
}

export function confirmPhonePenaltyReturn(studentId) {
  return apiRequest(`/api/admin/phone-penalties/${encodeURIComponent(studentId)}/return`, {
    method: 'POST',
  });
}

export function searchStudents(name) {
  const params = new URLSearchParams({ name });
  return apiRequest(`/api/admin/users/search?${params.toString()}`);
}

export function getAdminVacations() {
  return apiRequest('/api/vacations/all');
}

export function updateVacationStatus(vacationId, status) {
  return apiRequest(`/api/vacations/${encodeURIComponent(vacationId)}/status`, {
    method: 'PUT',
    body: { status },
  });
}

export function createAdminVacation(payload) {
  return apiRequest('/api/vacations/admin-create', {
    method: 'POST',
    body: payload,
  });
}

export function createMessage(payload) {
  return apiRequest('/api/admin/messages', {
    method: 'POST',
    body: payload,
  });
}
