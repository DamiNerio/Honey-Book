const USERS_KEY = 'book-violet-users-v2';
const SESSION_KEY = 'book-violet-session-v2';
const LANG_KEY = 'book-violet-lang-v2';

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
  // Fallback deterministic digest if WebCrypto subtle is unavailable
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
    return saved === 'es' ? 'es' : 'en';
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

export function getCurrentUser() {
  try {
    const rawSession = window.localStorage.getItem(SESSION_KEY);
    if (!rawSession) return null;
    const { accountKey } = JSON.parse(rawSession);
    if (!accountKey) return null;
    const users = loadUsersMap();
    const record = users[accountKey];
    if (!record) return null;
    return {
      id: record.id,
      name: record.name,
      accountKey,
    };
  } catch {
    return null;
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
  window.localStorage.setItem(SESSION_KEY, JSON.stringify({ accountKey: key }));

  return {
    id,
    name: cleanName,
    accountKey: key,
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

  window.localStorage.setItem(SESSION_KEY, JSON.stringify({ accountKey: key }));

  return {
    id: record.id,
    name: record.name,
    accountKey: key,
  };
}

export function logoutUser() {
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    // Ignore errors
  }
}
