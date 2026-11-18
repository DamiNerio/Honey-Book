import { isSupabaseConfigured, supabase } from '../services/supabase.js';
import { loadGuestLanguage } from './storage.js';

const LEGACY_USERS_KEY = 'honey_book_users';
const LEGACY_SESSION_KEY = 'honey_book_session';
const LANG_KEY = 'honey_book_language';

export const GUEST_USER = Object.freeze({
  id: 'guest',
  accountKey: 'guest',
  isGuest: true,
});

export function normalizeAccountKey(emailOrUsername) {
  return String(emailOrUsername || '').trim().toLowerCase();
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

export function clearLegacyAuthStorage() {
  try {
    window.localStorage.removeItem(LEGACY_USERS_KEY);
    window.localStorage.removeItem(LEGACY_SESSION_KEY);
  } catch {
    // Ignore storage errors
  }
}

export function isGuestUser(user) {
  return Boolean(!user || user.isGuest || user.id === 'guest');
}

export function continueAsGuest() {
  try {
    window.localStorage.removeItem(LEGACY_SESSION_KEY);
  } catch {
    // Ignore storage errors
  }
  return { ...GUEST_USER };
}

export function mapSupabaseUser(supaUser) {
  if (!supaUser || !supaUser.id) {
    return { ...GUEST_USER };
  }
  const metaName =
    typeof supaUser.user_metadata?.full_name === 'string' && supaUser.user_metadata.full_name.trim()
      ? supaUser.user_metadata.full_name.trim()
      : typeof supaUser.user_metadata?.name === 'string' && supaUser.user_metadata.name.trim()
      ? supaUser.user_metadata.name.trim()
      : '';
  const email = typeof supaUser.email === 'string' ? supaUser.email.trim() : '';
  const fallbackName = email ? email.split('@')[0] : 'Reader';

  return {
    id: supaUser.id,
    email,
    name: metaName || fallbackName,
    accountKey: normalizeAccountKey(email || supaUser.id),
    isGuest: false,
  };
}

export function getCurrentUser() {
  return { ...GUEST_USER };
}

export async function getSessionUser() {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }
  const { data, error } = await supabase.auth.getSession();
  if (error || !data?.session?.user) {
    return null;
  }
  return mapSupabaseUser(data.session.user);
}

function mapSupabaseAuthError(error) {
  const code = String(error?.code || '').toLowerCase();
  const message = String(error?.message || '').toLowerCase();

  if (
    code === 'user_already_exists' ||
    message.includes('already registered') ||
    message.includes('already exists')
  ) {
    return 'authErrExists';
  }
  if (
    code === 'invalid_credentials' ||
    message.includes('invalid login credentials')
  ) {
    return 'authErrInvalid';
  }
  if (
    code === 'email_not_confirmed' ||
    message.includes('email not confirmed')
  ) {
    return 'authErrEmailNotConfirmed';
  }
  if (
    code === 'weak_password' ||
    message.includes('password should be at least')
  ) {
    return 'authErrWeakPassword';
  }
  if (
    code.includes('rate_limit') ||
    message.includes('rate limit') ||
    message.includes('only request this after')
  ) {
    return 'authErrRateLimit';
  }
  if (
    code === 'validation_failed' ||
    message.includes('unable to validate email') ||
    message.includes('invalid email')
  ) {
    return 'authErrEmail';
  }
  if (
    message.includes('failed to fetch') ||
    message.includes('networkerror') ||
    message.includes('network request failed') ||
    message.includes('load failed')
  ) {
    return 'authErrNetwork';
  }

  return 'authErrGeneric';
}

export async function registerUser({ name, email, password }) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('authErrUnavailable');
  }

  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();

  const { data, error } = await supabase.auth.signUp({
    email: cleanEmail,
    password,
    options: {
      data: {
        full_name: cleanName,
        name: cleanName,
      },
    },
  });

  if (error) {
    throw new Error(mapSupabaseAuthError(error));
  }

  // Supabase obfuscates duplicate emails when confirmation is enabled by returning identities: []
  if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    throw new Error('authErrExists');
  }

  if (data?.user && data?.session) {
    return {
      user: mapSupabaseUser(data.user),
      session: data.session,
      needsEmailConfirmation: false,
      email: cleanEmail,
    };
  }

  if (data?.user) {
    return {
      user: null,
      session: null,
      needsEmailConfirmation: true,
      email: cleanEmail,
    };
  }

  throw new Error('authErrGeneric');
}

export async function loginUser({ email, password }) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('authErrUnavailable');
  }

  const cleanEmail = email.trim().toLowerCase();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password,
  });

  if (error) {
    throw new Error(mapSupabaseAuthError(error));
  }

  if (!data?.user) {
    throw new Error('authErrInvalid');
  }

  return {
    user: mapSupabaseUser(data.user),
    session: data.session,
  };
}

export async function logoutUser() {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore network sign-out errors so local guest transition still succeeds
    }
  }
  return continueAsGuest();
}

export function subscribeToAuthChanges(onAuthEvent) {
  if (!isSupabaseConfigured || !supabase) {
    return () => {};
  }

  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    onAuthEvent(event, session);
  });

  return () => {
    data?.subscription?.unsubscribe();
  };
}
