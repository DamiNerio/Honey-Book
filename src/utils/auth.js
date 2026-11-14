import { loadGuestLanguage } from './storage';

const USERS_KEY = 'honey_book_users';
const SESSION_KEY = 'honey_book_session';
const LANG_KEY = 'honey_book_language';

export const GUEST_USER = Object.freeze({
  id: 'guest',
  accountKey: 'guest',
  isGuest: true,
});

function loadUsersMap() {
  try {
    const raw = window.localStorage.getItem(USERS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function saveUsersMap(users) {
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function generateId(prefix = 'id') {
  if (window.crypto?.randomUUID) {
    return `${prefix}-${window.crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

async function hashPassword(password, salt) {
  const input = `${salt}::${password}`;
  if (window.crypto?.subtle) {
    const encoded = new TextEncoder().encode(input);
    const buffer = await window.crypto.subtle.digest('SHA-256', encoded);
    return Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

export function normalizeAccountKey(emailOrUsername) {
  return emailOrUsername.trim().toLowerCase();
}

export function getStoredLanguage() {
  try {
    const saved = window.localStorage.getItem(LANG_KEY);
    if (saved === 'es' || saved === 'en') {
      return saved;
    }
    const guestLang = loadGuestLanguage();
    return guestLang === 'es' ? 'es' : 'en';
  } catch {
    return 'en';
  }
}

export function saveStoredLanguage(lang) {
  try {
    window.localStorage.setItem(LANG_KEY, lang === 'es' ? 'es' : 'en');
  } catch {
    // Ignore storage errors
  }
}

export function isGuestUser(user) {
  return Boolean(!user || user.isGuest || user.id === 'guest');
}

export function continueAsGuest() {
  try {
    window.localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ isGuest: true, accountKey: 'guest' })
    );
  } catch {
    // Ignore storage errors
  }
  return { ...GUEST_USER };
}

export function getCurrentUser() {
  try {
    const rawSession = window.localStorage.getItem(SESSION_KEY);
    if (!rawSession) {
      return { ...GUEST_USER };
    }
    const parsed = JSON.parse(rawSession);
    if (!parsed || parsed.isGuest || !parsed.accountKey || parsed.accountKey === 'guest') {
      return { ...GUEST_USER };
    }
    const users = loadUsersMap();
    const record = users[parsed.accountKey];
    if (!record) {
      return { ...GUEST_USER };
    }
    return {
      id: record.id,
      name: record.name,
      accountKey: parsed.accountKey,
      isGuest: false,
    };
  } catch {
    return { ...GUEST_USER };
  }
}

export async function registerUser({ name, email, password }) {
  const cleanName = name.trim();
  const key = normalizeAccountKey(email);

  const users = loadUsersMap();
  if (users[key]) {
    throw new Error('authErrExists');
  }

  const salt = generateId('salt');
  const passwordHash = await hashPassword(password, salt);
  const id = generateId('usr');

  users[key] = {
    id,
    name: cleanName,
    accountKey: key,
    salt,
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  saveUsersMap(users);
  window.localStorage.setItem(SESSION_KEY, JSON.stringify({ accountKey: key, isGuest: false }));

  return {
    id,
    name: cleanName,
    accountKey: key,
    isGuest: false,
  };
}

export async function loginUser({ email, password }) {
  const key = normalizeAccountKey(email);
  const users = loadUsersMap();
  const record = users[key];

  if (!record) {
    throw new Error('authErrInvalid');
  }

  const candidateHash = await hashPassword(password, record.salt);
  if (candidateHash !== record.passwordHash) {
    throw new Error('authErrInvalid');
  }

  window.localStorage.setItem(SESSION_KEY, JSON.stringify({ accountKey: key, isGuest: false }));

  return {
    id: record.id,
    name: record.name,
    accountKey: key,
    isGuest: false,
  };
}

export function logoutUser() {
  return continueAsGuest();
}
