import { getAccessToken } from '@/lib/auth/session';

export class ApiError extends Error {
  constructor(message, { status, errors, data, code } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors && typeof errors === 'object' ? errors : {};
    this.data = data;
    this.code = code || data?.code || null;
  }
}

function getApiBaseUrl() {
  const url = process.env.NEXT_PUBLIC_API_URL;

  if (!url) {
    throw new ApiError('כתובת השרת אינה מוגדרת. יש להגדיר NEXT_PUBLIC_API_URL.');
  }

  return url.replace(/\/$/, '');
}

async function parseJson(response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function apiRequest(path, { method = 'GET', body, headers } = {}) {
  const url = `${getApiBaseUrl()}${path}`;
  const token = getAccessToken();
  let response;

  try {
    response = await fetch(url, {
      method,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('לא ניתן להתחבר לשרת. בדקו את החיבור ונסו שוב.');
  }

  const data = await parseJson(response);

  if (!response.ok) {
    throw new ApiError(data?.message || 'אירעה שגיאה בשרת', {
      status: response.status,
      errors: data?.errors,
      data,
      code: data?.code,
    });
  }

  return data;
}
