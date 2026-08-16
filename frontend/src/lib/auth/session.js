import { useSyncExternalStore } from 'react';

const SESSION_KEY = 'chedvata.session';
const listeners = new Set();

let cachedRaw;
let cachedValue = null;

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function parseSession(raw) {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);

    if (!parsed?.token || !parsed?.user) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function getClientSnapshot() {
  const raw = window.sessionStorage.getItem(SESSION_KEY);

  if (raw === cachedRaw) {
    return cachedValue;
  }

  cachedRaw = raw;
  cachedValue = parseSession(raw);

  if (raw && !cachedValue) {
    window.sessionStorage.removeItem(SESSION_KEY);
    cachedRaw = null;
    cachedValue = null;
  }

  return cachedValue;
}

function getServerSnapshot() {
  return null;
}

export function saveSession({ token, user }) {
  if (typeof window === 'undefined' || !token || !user) {
    return;
  }

  const value = { token, user };
  const raw = JSON.stringify(value);
  window.sessionStorage.setItem(SESSION_KEY, raw);
  cachedRaw = raw;
  cachedValue = value;
  emit();
}

export function clearSession() {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.removeItem(SESSION_KEY);
  cachedRaw = null;
  cachedValue = null;
  emit();
}

export function getSession() {
  if (typeof window === 'undefined') {
    return null;
  }

  return getClientSnapshot();
}

export function getAccessToken() {
  return getSession()?.token ?? null;
}

export function updateSessionUser(user) {
  const session = getSession();

  if (!session?.token || !user) {
    return;
  }

  saveSession({ token: session.token, user });
}

export function useSession() {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
