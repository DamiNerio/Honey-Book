export const GUEST_DATA_KEY = 'honey_book_guest_data';
const ACCOUNT_LIBRARY_PREFIX = 'honey_book_library_';

export function createEmptyLibrary(language = 'en') {
  return {
    books: [],
    wishlistIds: [],
    reading: {},
    completed: {},
    timer: {
      activeBookId: null,
      isRunning: false,
      elapsedSeconds: 0,
      lastStartedAtMs: null,
    },
    customGenres: [],
    language: language === 'es' ? 'es' : 'en',
  };
}

export function getLibraryStorageKey(userId) {
  if (!userId || userId === 'guest') {
    return GUEST_DATA_KEY;
  }
  return `${ACCOUNT_LIBRARY_PREFIX}${userId}`;
}

export function clearLegacySeedStorage() {
  try {
    window.localStorage.removeItem('book-violet-state-v1');
  } catch {
    // Ignore storage access errors
  }
}

export function loadGuestLanguage() {
  try {
    const raw = window.localStorage.getItem(GUEST_DATA_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.language === 'es' || parsed?.language === 'en' ? parsed.language : null;
  } catch {
    return null;
  }
}

export function loadUserLibrary(userId, defaultLanguage = 'en') {
  const key = getLibraryStorageKey(userId);
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return createEmptyLibrary(defaultLanguage);

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return createEmptyLibrary(defaultLanguage);
    }

    const resolvedLang =
      parsed.language === 'es' || parsed.language === 'en'
        ? parsed.language
        : defaultLanguage === 'es'
        ? 'es'
        : 'en';
    const fallback = createEmptyLibrary(resolvedLang);

    return {
      books: Array.isArray(parsed.books) ? parsed.books : [],
      wishlistIds: Array.isArray(parsed.wishlistIds) ? parsed.wishlistIds : [],
      reading: parsed.reading && typeof parsed.reading === 'object' ? parsed.reading : {},
      completed: parsed.completed && typeof parsed.completed === 'object' ? parsed.completed : {},
      timer:
        parsed.timer && typeof parsed.timer === 'object'
          ? {
              activeBookId: parsed.timer.activeBookId ?? null,
              isRunning: Boolean(parsed.timer.isRunning),
              elapsedSeconds: Number(parsed.timer.elapsedSeconds) || 0,
              lastStartedAtMs: parsed.timer.lastStartedAtMs ?? null,
            }
          : fallback.timer,
      customGenres: Array.isArray(parsed.customGenres)
        ? parsed.customGenres.filter((g) => typeof g === 'string' && g.trim().length > 0)
        : [],
      language: resolvedLang,
    };
  } catch {
    return createEmptyLibrary(defaultLanguage);
  }
}

export function saveUserLibrary(userId, state) {
  const key = getLibraryStorageKey(userId);
  try {
    window.localStorage.setItem(key, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors safely
  }
}

export function clearUserLibrary(userId, language = 'en') {
  const key = getLibraryStorageKey(userId);
  const fresh = createEmptyLibrary(language);
  try {
    window.localStorage.setItem(key, JSON.stringify(fresh));
  } catch {
    // Ignore storage access errors
  }
  return fresh;
}
