// Internal book search service configuration (hidden from UI)
const GOOGLE_BOOKS_CONFIG = {
  endpoint: 'https://www.googleapis.com/books/v1/volumes',
  maxResults: 12,
  printType: 'books',
  apiKey: import.meta.env.VITE_GOOGLE_BOOKS_API_KEY || '',
};

const searchCache = new Map();

export class BookSearchError extends Error {
  constructor(code = 'SEARCH_UNAVAILABLE') {
    super(code);
    this.name = 'BookSearchError';
    this.code = code;
  }
}

function decodeAndStripHtml(raw) {
  if (!raw || typeof raw !== 'string') return '';
  return raw
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/p>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeCoverUrl(imageLinks) {
  const raw =
    imageLinks?.thumbnail ||
    imageLinks?.smallThumbnail ||
    imageLinks?.medium ||
    imageLinks?.small ||
    '';

  if (!raw) return '';

  return raw
    .replace(/^http:\/\/(?!localhost\b|127\.0\.0\.1\b)/i, 'https://')
    .replace(/&edge=curl/gi, '');
}

function parseYear(publishedDate) {
  if (!publishedDate || typeof publishedDate !== 'string') return null;
  const match = publishedDate.match(/\d{4}/);
  return match ? parseInt(match[0], 10) : null;
}

export function normalizeBookResult(item) {
  const info = item?.volumeInfo || {};
  const authors =
    Array.isArray(info.authors) && info.authors.length > 0
      ? info.authors.join(', ')
      : 'Unknown Author';

  const rawGenre =
    Array.isArray(info.categories) && info.categories.length > 0
      ? info.categories[0].split('/')[0].trim()
      : 'General';

  const pageCount =
    typeof info.pageCount === 'number' && info.pageCount > 0
      ? Math.round(info.pageCount)
      : null;

  const synopsis =
    decodeAndStripHtml(info.description) ||
    decodeAndStripHtml(item?.searchInfo?.textSnippet) ||
    '';

  return {
    id: `vol-${item.id}`,
    title: info.title ? info.title.trim() : 'Untitled',
    author: authors,
    genre: rawGenre || 'General',
    year: parseYear(info.publishedDate),
    totalPages: pageCount,
    cover: normalizeCoverUrl(info.imageLinks),
    synopsis,
  };
}

export async function searchBooksCatalog(query, { signal } = {}) {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  const cacheKey = cleanQuery.toLowerCase();
  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey);
  }

  const params = new URLSearchParams({
    q: cleanQuery,
    maxResults: String(GOOGLE_BOOKS_CONFIG.maxResults),
    printType: GOOGLE_BOOKS_CONFIG.printType,
  });

  if (GOOGLE_BOOKS_CONFIG.apiKey) {
    params.set('key', GOOGLE_BOOKS_CONFIG.apiKey);
  }

  let response;
  try {
    response = await fetch(`${GOOGLE_BOOKS_CONFIG.endpoint}?${params.toString()}`, {
      method: 'GET',
      signal,
    });
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw err;
    }
    throw new BookSearchError('NETWORK_ERROR');
  }

  if (!response.ok) {
    throw new BookSearchError('SEARCH_UNAVAILABLE');
  }

  const data = await response.json();
  const items = Array.isArray(data?.items) ? data.items : [];
  const normalized = items.map(normalizeBookResult);

  searchCache.set(cacheKey, normalized);
  return normalized;
}
