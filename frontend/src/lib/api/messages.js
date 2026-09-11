import { apiRequest } from '@/lib/api/client';

export function getMessages() {
  return apiRequest('/api/messages');
}
