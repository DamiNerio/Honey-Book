const LIBRARY_KEY_PREFIX = 'book-violet-library-v2-';

export function createEmptyLibrary() {
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
  };
}

export function clearLegacySeedStorage() {
  try {
    window.localStorage.removeItem('book-violet-state-v1');
  } catch {
    // Ignore storage errors
  }
}

export function loadUserLibrary(userId) {
  if (!userId) return createEmptyLibrary();

  try {
    const raw = window.localStorage.getItem(`${LIBRARY_KEY_PREFIX}${userId}`);
    if (!raw) return createEmptyLibrary();

    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.books)) {
      return createEmptyLibrary();
    }

    return {
      books: parsed.books,
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
          : createEmptyLibrary().timer,
    };
  } catch {
    return createEmptyLibrary();
  }
}

export function saveUserLibrary(userId, state) {
  if (!userId) return;
  try {
    window.localStorage.setItem(`${LIBRARY_KEY_PREFIX}${userId}`, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors safely
  }
}

export function clearUserLibrary(userId) {
  if (userId) {
    try {
      window.localStorage.removeItem(`${LIBRARY_KEY_PREFIX}${userId}`);
    } catch {
      // Ignore storage access errors
    }
  }
  return createEmptyLibrary();
}
