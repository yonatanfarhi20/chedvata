import { apiRequest } from '@/lib/api/client';

export function getPendingUsers() {
  return apiRequest('/api/admin/users/pending');
}
