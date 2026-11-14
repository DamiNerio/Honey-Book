const GOOGLE_BOOKS_ENDPOINT = 'https://www.googleapis.com/books/v1/volumes';

const searchCache = new Map();

export class GoogleBooksError extends Error {
  constructor(message, code = 'API_ERROR', status = 0) {
    super(message);
    this.name = 'GoogleBooksError';
    this.code = code;
    this.status = status;
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

export function normalizeGoogleBook(item) {
  const info = item?.volumeInfo || {};
  const authors = Array.isArray(info.authors) && info.authors.length > 0
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
    'No synopsis was provided by Google Books for this edition.';

  return {
    id: `gb-${item.id}`,
    googleId: item.id,
    source: 'google-books',
    title: info.title ? info.title.trim() : 'Untitled Volume',
    subtitle: info.subtitle ? info.subtitle.trim() : '',
    author: authors,
    genre: rawGenre || 'General',
    year: parseYear(info.publishedDate),
    totalPages: pageCount,
    cover: normalizeCoverUrl(info.imageLinks),
    synopsis,
  };
}

export async function searchGoogleBooks(query, { apiKey = '', signal, maxResults = 12 } = {}) {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  const cacheKey = `${cleanQuery.toLowerCase()}::${apiKey.trim()}::${maxResults}`;
  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey);
  }

  const params = new URLSearchParams({
    q: cleanQuery,
    maxResults: String(maxResults),
    printType: 'books',
  });

  if (apiKey.trim()) {
    params.set('key', apiKey.trim());
  }

  let response;
  try {
    response = await fetch(`${GOOGLE_BOOKS_ENDPOINT}?${params.toString()}`, {
      method: 'GET',
      signal,
    });
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw err;
    }
    throw new GoogleBooksError(
      'Unable to reach Google Books API. Check your internet connection and try again.',
      'NETWORK_ERROR',
      0
    );
  }

  if (!response.ok) {
    let message = `Google Books returned status ${response.status}.`;
    try {
      const errJson = await response.json();
      if (errJson?.error?.message) {
        message = errJson.error.message;
      }
    } catch {
      // Ignore parse failures
    }

    if (response.status === 429) {
      throw new GoogleBooksError(
        'Google Books public query quota exceeded (HTTP 429). Add a personal Google Books API key or try again later.',
        'QUOTA_EXCEEDED',
        429
      );
    }

    if (response.status === 400 || response.status === 403) {
      const lower = message.toLowerCase();
      if (lower.includes('key') || lower.includes('quota') || lower.includes('limit')) {
        throw new GoogleBooksError(
          lower.includes('key')
            ? 'The provided Google Books API key was rejected. Check your key or clear it to use public requests.'
            : 'Google Books API quota limit reached. Try again later or configure an API key.',
          lower.includes('key') ? 'INVALID_KEY' : 'QUOTA_EXCEEDED',
          response.status
        );
      }
    }

    throw new GoogleBooksError(message, 'HTTP_ERROR', response.status);
  }

  const data = await response.json();
  const items = Array.isArray(data?.items) ? data.items : [];
  const normalized = items.map(normalizeGoogleBook);

  searchCache.set(cacheKey, normalized);
  return normalized;
}
