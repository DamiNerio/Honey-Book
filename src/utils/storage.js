import { supabase } from '../services/supabase.js';

export const GUEST_DATA_KEY = 'honey_book_guest_data';
const ACCOUNT_LIBRARY_PREFIX = 'honey_book_library_';
const CLOUD_SYNC_DEBOUNCE_MS = 650;

const inFlightMigrations = new Map();
let pendingSyncTimer = null;
let pendingSyncState = null;

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

function normalizeLoadedLibrary(parsed, defaultLanguage = 'en') {
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
}

export function loadUserLibrary(userId, defaultLanguage = 'en') {
  const key = getLibraryStorageKey(userId);
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return createEmptyLibrary(defaultLanguage);
    return normalizeLoadedLibrary(JSON.parse(raw), defaultLanguage);
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

export function hasLocalGuestData() {
  try {
    const raw = window.localStorage.getItem(GUEST_DATA_KEY);
    if (!raw) return false;
    const guest = loadUserLibrary('guest');
    return Boolean(
      guest.books.length > 0 ||
        guest.wishlistIds.length > 0 ||
        Object.keys(guest.reading).length > 0 ||
        Object.keys(guest.completed).length > 0 ||
        guest.customGenres.length > 0
    );
  } catch {
    return false;
  }
}

export function clearLocalGuestData() {
  try {
    window.localStorage.removeItem(GUEST_DATA_KEY);
    window.localStorage.removeItem(`${ACCOUNT_LIBRARY_PREFIX}guest`);
  } catch {
    // Ignore storage access errors
  }
}

function normalizeIsbnValue(raw) {
  if (!raw || typeof raw !== 'string') return '';
  const cleaned = raw.replace(/[^0-9X]/gi, '').toUpperCase();
  return cleaned.length >= 9 ? cleaned : '';
}

export function getBookIdentityKeys(book) {
  if (!book || typeof book !== 'object') return [];
  const keys = [];
  if (book.id) {
    keys.push(`id:${String(book.id).trim()}`);
  }
  const directIsbn = [book.isbn, book.isbn13, book.isbn10];
  for (const candidate of directIsbn) {
    const norm = normalizeIsbnValue(candidate);
    if (norm) keys.push(`isbn:${norm}`);
  }
  if (Array.isArray(book.industryIdentifiers)) {
    for (const entry of book.industryIdentifiers) {
      const norm = normalizeIsbnValue(entry?.identifier);
      if (norm) keys.push(`isbn:${norm}`);
    }
  }
  return keys;
}

export function serializeLibraryForCloud(userId, libraryData) {
  const safeLib = normalizeLoadedLibrary(libraryData, libraryData?.language || 'en');
  const seenIds = new Set();
  const books = [];

  for (const book of safeLib.books) {
    if (!book || typeof book !== 'object' || !book.id || seenIds.has(book.id)) continue;
    seenIds.add(book.id);
    const cleanBook = { ...book };
    delete cleanBook.readingProgress;
    delete cleanBook.timerState;

    const readingEntry = safeLib.reading[book.id];
    if (readingEntry && !safeLib.completed[book.id]) {
      cleanBook.readingProgress = {
        currentPage: Number(readingEntry.currentPage) || 0,
        completionPercentage: Number(readingEntry.completionPercentage) || 0,
        startedAt: readingEntry.startedAt || new Date().toISOString(),
        sessions: Array.isArray(readingEntry.sessions) ? readingEntry.sessions : [],
      };
    }

    if (
      safeLib.timer?.activeBookId === book.id &&
      !safeLib.completed[book.id]
    ) {
      cleanBook.timerState = {
        isRunning: Boolean(safeLib.timer.isRunning),
        elapsedSeconds: Number(safeLib.timer.elapsedSeconds) || 0,
        lastStartedAtMs: safeLib.timer.lastStartedAtMs ?? null,
      };
    }

    books.push(cleanBook);
  }

  const wishlist = [];
  const seenWishlist = new Set();
  for (const id of safeLib.wishlistIds) {
    if (typeof id === 'string' && id && !seenWishlist.has(id)) {
      seenWishlist.add(id);
      wishlist.push(id);
    }
  }

  const customGenres = [];
  const seenGenres = new Set();
  for (const genre of safeLib.customGenres) {
    const trimmed = typeof genre === 'string' ? genre.trim() : '';
    const key = trimmed.toLowerCase();
    if (trimmed && !seenGenres.has(key)) {
      seenGenres.add(key);
      customGenres.push(trimmed);
    }
  }

  return {
    user_id: userId,
    books,
    wishlist,
    completed: safeLib.completed,
    custom_genres: customGenres,
    updated_at: new Date().toISOString(),
  };
}

export function deserializeCloudLibrary(row, fallbackLanguage = 'en') {
  const empty = createEmptyLibrary(fallbackLanguage);
  if (!row || typeof row !== 'object') {
    return empty;
  }

  const rawBooks = Array.isArray(row.books) ? row.books : [];
  const rawWishlist = Array.isArray(row.wishlist) ? row.wishlist : [];
  const rawGenres = Array.isArray(row.custom_genres) ? row.custom_genres : [];
  const rawCompleted =
    row.completed && typeof row.completed === 'object' && !Array.isArray(row.completed)
      ? { ...row.completed }
      : {};

  const books = [];
  const seenBookIds = new Set();
  const reading = {};
  let timer = { ...empty.timer };

  for (const item of rawBooks) {
    if (!item || typeof item !== 'object' || !item.id) continue;
    const { readingProgress, timerState, ...cleanBook } = item;

    if (!seenBookIds.has(cleanBook.id)) {
      seenBookIds.add(cleanBook.id);
      books.push(cleanBook);
    }

    if (
      readingProgress &&
      typeof readingProgress === 'object' &&
      !rawCompleted[cleanBook.id]
    ) {
      reading[cleanBook.id] = {
        currentPage: Number(readingProgress.currentPage) || 0,
        completionPercentage: Number(readingProgress.completionPercentage) || 0,
        startedAt: readingProgress.startedAt || new Date().toISOString(),
        sessions: Array.isArray(readingProgress.sessions) ? readingProgress.sessions : [],
      };
    }

    if (timerState && typeof timerState === 'object' && !rawCompleted[cleanBook.id]) {
      timer = {
        activeBookId: cleanBook.id,
        isRunning: Boolean(timerState.isRunning),
        elapsedSeconds: Number(timerState.elapsedSeconds) || 0,
        lastStartedAtMs: timerState.lastStartedAtMs ?? null,
      };
    }
  }

  const wishlistIds = [];
  const seenWishIds = new Set();
  for (const entry of rawWishlist) {
    if (typeof entry === 'string') {
      if (entry && !seenWishIds.has(entry) && !rawCompleted[entry] && !reading[entry]) {
        seenWishIds.add(entry);
        wishlistIds.push(entry);
      }
    } else if (entry && typeof entry === 'object' && entry.id) {
      if (!seenBookIds.has(entry.id)) {
        seenBookIds.add(entry.id);
        books.push(entry);
      }
      if (!seenWishIds.has(entry.id) && !rawCompleted[entry.id] && !reading[entry.id]) {
        seenWishIds.add(entry.id);
        wishlistIds.push(entry.id);
      }
    }
  }

  const customGenres = [];
  const seenGenres = new Set();
  for (const g of rawGenres) {
    if (typeof g !== 'string') continue;
    const trimmed = g.trim();
    const key = trimmed.toLowerCase();
    if (trimmed && !seenGenres.has(key)) {
      seenGenres.add(key);
      customGenres.push(trimmed);
    }
  }

  return {
    books,
    wishlistIds,
    reading,
    completed: rawCompleted,
    timer,
    customGenres,
    language: fallbackLanguage === 'es' ? 'es' : 'en',
  };
}

export function mergeLibrariesForMigration(cloudLibrary, guestLibrary) {
  const baseLang = guestLibrary?.language || cloudLibrary?.language || 'en';
  const cloud = normalizeLoadedLibrary(cloudLibrary, baseLang);
  const guest = normalizeLoadedLibrary(guestLibrary, baseLang);

  const mergedBooks = [];
  const keyToBookId = new Map();
  const remappedIds = {};

  for (const book of cloud.books) {
    if (!book || typeof book !== 'object' || !book.id) continue;
    const keys = getBookIdentityKeys(book);
    if (keys.some((k) => keyToBookId.has(k))) continue;
    mergedBooks.push(book);
    for (const key of keys) {
      keyToBookId.set(key, book.id);
    }
  }

  for (const book of guest.books) {
    if (!book || typeof book !== 'object' || !book.id) continue;
    const keys = getBookIdentityKeys(book);
    const matchedKey = keys.find((k) => keyToBookId.has(k));
    if (matchedKey) {
      remappedIds[book.id] = keyToBookId.get(matchedKey);
      continue;
    }
    mergedBooks.push(book);
    for (const key of keys) {
      keyToBookId.set(key, book.id);
    }
  }

  const mergedCompleted = { ...cloud.completed };
  for (const [guestBookId, record] of Object.entries(guest.completed)) {
    const targetId = remappedIds[guestBookId] || guestBookId;
    if (!mergedCompleted[targetId] && record && typeof record === 'object') {
      mergedCompleted[targetId] = record;
    }
  }

  const mergedReading = {};
  for (const [cloudBookId, entry] of Object.entries(cloud.reading)) {
    if (!mergedCompleted[cloudBookId] && entry && typeof entry === 'object') {
      mergedReading[cloudBookId] = entry;
    }
  }
  for (const [guestBookId, entry] of Object.entries(guest.reading)) {
    const targetId = remappedIds[guestBookId] || guestBookId;
    if (!mergedCompleted[targetId] && !mergedReading[targetId] && entry && typeof entry === 'object') {
      mergedReading[targetId] = entry;
    }
  }

  const mergedWishlistIds = [];
  const seenWishlist = new Set();
  for (const id of cloud.wishlistIds) {
    if (id && !seenWishlist.has(id) && !mergedCompleted[id] && !mergedReading[id]) {
      seenWishlist.add(id);
      mergedWishlistIds.push(id);
    }
  }
  for (const id of guest.wishlistIds) {
    const targetId = remappedIds[id] || id;
    if (targetId && !seenWishlist.has(targetId) && !mergedCompleted[targetId] && !mergedReading[targetId]) {
      seenWishlist.add(targetId);
      mergedWishlistIds.push(targetId);
    }
  }

  let mergedTimer = cloud.timer;
  if (mergedTimer?.activeBookId && mergedCompleted[mergedTimer.activeBookId]) {
    mergedTimer = createEmptyLibrary(baseLang).timer;
  }
  if (!mergedTimer?.activeBookId && guest.timer?.activeBookId) {
    const targetTimerBookId = remappedIds[guest.timer.activeBookId] || guest.timer.activeBookId;
    if (!mergedCompleted[targetTimerBookId]) {
      mergedTimer = {
        ...guest.timer,
        activeBookId: targetTimerBookId,
      };
    }
  }

  const mergedGenres = [];
  const seenGenres = new Set();
  for (const g of [...cloud.customGenres, ...guest.customGenres]) {
    const trimmed = typeof g === 'string' ? g.trim() : '';
    const key = trimmed.toLowerCase();
    if (trimmed && !seenGenres.has(key)) {
      seenGenres.add(key);
      mergedGenres.push(trimmed);
    }
  }

  return {
    books: mergedBooks,
    wishlistIds: mergedWishlistIds,
    reading: mergedReading,
    completed: mergedCompleted,
    timer: mergedTimer || createEmptyLibrary(baseLang).timer,
    customGenres: mergedGenres,
    language: baseLang === 'es' ? 'es' : 'en',
  };
}

export async function fetchUserLibrary(userId, fallbackLanguage = 'en') {
  if (!userId || userId === 'guest') {
    return loadUserLibrary('guest', fallbackLanguage);
  }
  if (!supabase) {
    return loadUserLibrary(userId, fallbackLanguage);
  }

  const { data, error } = await supabase
    .from('user_library')
    .select('user_id, books, wishlist, completed, custom_genres, updated_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  const normalized = data
    ? deserializeCloudLibrary(data, fallbackLanguage)
    : createEmptyLibrary(fallbackLanguage);

  saveUserLibrary(userId, normalized);
  return normalized;
}

async function upsertUserLibraryNow(userId, libraryData) {
  if (!userId || userId === 'guest' || !supabase) {
    return null;
  }
  const payload = serializeLibraryForCloud(userId, libraryData);
  const { error } = await supabase
    .from('user_library')
    .upsert(payload, { onConflict: 'user_id' });

  if (error) {
    throw error;
  }

  saveUserLibrary(userId, libraryData);
  return payload;
}

function executePendingSync() {
  if (!pendingSyncState) return Promise.resolve(null);

  const snapshot = pendingSyncState;
  pendingSyncState = null;
  if (pendingSyncTimer) {
    window.clearTimeout(pendingSyncTimer);
    pendingSyncTimer = null;
  }

  snapshot.onSyncStart?.();
  return upsertUserLibraryNow(snapshot.userId, snapshot.libraryData)
    .then((result) => {
      snapshot.onSyncSuccess?.(result);
      for (const { resolve } of snapshot.waiters) {
        resolve(result);
      }
      return result;
    })
    .catch((err) => {
      snapshot.onSyncError?.(err);
      for (const { reject } of snapshot.waiters) {
        reject(err);
      }
      throw err;
    });
}

export function cancelPendingCloudSync(targetUserId = null) {
  if (!pendingSyncState) return;
  if (targetUserId && pendingSyncState.userId !== targetUserId) return;

  if (pendingSyncTimer) {
    window.clearTimeout(pendingSyncTimer);
    pendingSyncTimer = null;
  }
  const waiters = pendingSyncState.waiters;
  pendingSyncState = null;
  for (const { resolve } of waiters) {
    resolve(null);
  }
}

export async function flushPendingCloudSync() {
  if (!pendingSyncState) return null;
  return executePendingSync().catch(() => null);
}

export function syncUserLibrary(
  userId,
  libraryData,
  {
    debounceMs = CLOUD_SYNC_DEBOUNCE_MS,
    onSyncStart = null,
    onSyncSuccess = null,
    onSyncError = null,
  } = {}
) {
  if (!userId || userId === 'guest') {
    saveUserLibrary('guest', libraryData);
    return Promise.resolve(null);
  }

  saveUserLibrary(userId, libraryData);

  if (!supabase) {
    return Promise.resolve(null);
  }

  if (pendingSyncState && pendingSyncState.userId !== userId) {
    executePendingSync().catch(() => {});
  }

  if (pendingSyncTimer) {
    window.clearTimeout(pendingSyncTimer);
    pendingSyncTimer = null;
  }

  return new Promise((resolve, reject) => {
    const existingWaiters = pendingSyncState?.waiters || [];
    pendingSyncState = {
      userId,
      libraryData,
      onSyncStart,
      onSyncSuccess,
      onSyncError,
      waiters: [...existingWaiters, { resolve, reject }],
    };

    pendingSyncTimer = window.setTimeout(() => {
      executePendingSync().catch(() => {});
    }, debounceMs);
  });
}

export async function syncUserLibraryImmediate(userId, libraryData) {
  cancelPendingCloudSync(userId);
  if (!userId || userId === 'guest') {
    saveUserLibrary('guest', libraryData);
    return null;
  }
  saveUserLibrary(userId, libraryData);
  return upsertUserLibraryNow(userId, libraryData);
}

export async function migrateGuestDataToCloud(userId, fallbackLanguage = 'en') {
  if (!userId || userId === 'guest') {
    return loadUserLibrary('guest', fallbackLanguage);
  }

  if (inFlightMigrations.has(userId)) {
    return inFlightMigrations.get(userId);
  }

  const migrationPromise = (async () => {
    if (!hasLocalGuestData()) {
      return fetchUserLibrary(userId, fallbackLanguage);
    }

    const guestLibrary = loadUserLibrary('guest', fallbackLanguage);
    if (!supabase) {
      return guestLibrary;
    }

    const cloudLibrary = await fetchUserLibrary(userId, guestLibrary.language || fallbackLanguage);
    const mergedLibrary = mergeLibrariesForMigration(cloudLibrary, guestLibrary);

    await upsertUserLibraryNow(userId, mergedLibrary);
    clearLocalGuestData();
    return mergedLibrary;
  })();

  inFlightMigrations.set(userId, migrationPromise);
  try {
    return await migrationPromise;
  } finally {
    inFlightMigrations.delete(userId);
  }
}
