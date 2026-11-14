import { INITIAL_STATE } from '../data/booksSeed';

const STORAGE_KEY = 'book-violet-state-v1';

export function cloneInitialState() {
  return {
    ...JSON.parse(JSON.stringify(INITIAL_STATE)),
    apiKey: import.meta.env?.VITE_GOOGLE_BOOKS_API_KEY || '',
  };
}

export function loadLibraryState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneInitialState();

    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.books)) {
      return cloneInitialState();
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
          : {
              activeBookId: null,
              isRunning: false,
              elapsedSeconds: 0,
              lastStartedAtMs: null,
            },
      apiKey:
        typeof parsed.apiKey === 'string'
          ? parsed.apiKey
          : import.meta.env?.VITE_GOOGLE_BOOKS_API_KEY || '',
    };
  } catch {
    return cloneInitialState();
  }
}

export function saveLibraryState(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors safely
  }
}

export function clearLibraryState() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage access errors
  }
  return cloneInitialState();
}
