import { useEffect, useMemo, useState } from 'react';
import { GENRES } from '../data/booksSeed';
import { searchGoogleBooks } from '../services/googleBooks';
import BookCover from './BookCover';
import {
  BookmarkIcon,
  BookOpenIcon,
  CheckCircleIcon,
  CloseIcon,
  PlusIcon,
  SearchIcon,
} from './Icons';
import { getCompletionPercentage } from '../utils/formatters';

const SUGGESTED_QUERIES = ['Dune', 'Haruki Murakami', 'Project Hail Mary', 'Sapiens'];

function BookCard({
  book,
  isWishlisted,
  readingEntry,
  completedEntry,
  onSelectBook,
  onToggleWishlist,
  onStartReading,
  onOpenSection,
  badgeLabel,
}) {
  const progressPct =
    readingEntry && book.totalPages
      ? getCompletionPercentage(readingEntry.currentPage, book.totalPages)
      : 0;

  return (
    <article className="book-card" data-book-id={book.id}>
      <div className="book-card__top">
        <button
          type="button"
          className="book-card__cover-btn"
          onClick={() => onSelectBook(book)}
          aria-label={`View details for ${book.title}`}
        >
          <BookCover book={book} size="md" />
        </button>

        <div className="book-card__info">
          <div className="book-card__meta">
            <span>{book.genre}</span>
            <span aria-hidden="true">·</span>
            <span className="mono-num">
              {book.totalPages ? `${book.totalPages}p` : 'Pages N/A'}
            </span>
            {badgeLabel && (
              <>
                <span aria-hidden="true">·</span>
                <span className="book-card__source-tag">{badgeLabel}</span>
              </>
            )}
          </div>

          <h2 className="book-card__title">
            <button
              type="button"
              className="book-card__title-btn"
              onClick={() => onSelectBook(book)}
            >
              {book.title}
            </button>
          </h2>

          <p className="book-card__author">{book.author}</p>

          <p className="book-card__synopsis">{book.synopsis}</p>
        </div>
      </div>

      {readingEntry && (
        <div className="book-card__progress">
          <div className="book-card__progress-labels">
            <span>Reading</span>
            <span className="mono-num">{progressPct}%</span>
          </div>
          <div className="progress-track progress-track--thin">
            <div className="progress-track__fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      )}

      <div className="book-card__actions">
        {readingEntry ? (
          <button
            type="button"
            className="btn btn--violet-soft btn--sm"
            onClick={() => onOpenSection('reading', book.id)}
          >
            <BookOpenIcon size={14} />
            <span>Continue ({progressPct}%)</span>
          </button>
        ) : completedEntry ? (
          <button
            type="button"
            className="btn btn--sage-soft btn--sm"
            onClick={() => onOpenSection('completed', book.id)}
          >
            <CheckCircleIcon size={14} />
            <span>Completed</span>
          </button>
        ) : (
          <>
            <button
              type="button"
              id={`wishlist-toggle-${book.id}`}
              className={`btn btn--sm ${
                isWishlisted ? 'btn--violet-outline' : 'btn--ghost'
              }`}
              onClick={() => onToggleWishlist(book)}
              aria-pressed={isWishlisted}
            >
              <BookmarkIcon filled={isWishlisted} size={14} />
              <span>{isWishlisted ? 'Wishlisted' : 'Wishlist'}</span>
            </button>

            <button
              type="button"
              id={`start-reading-${book.id}`}
              className="btn btn--violet-soft btn--sm"
              onClick={() => onStartReading(book)}
            >
              <BookOpenIcon size={14} />
              <span>Read</span>
            </button>
          </>
        )}
      </div>
    </article>
  );
}

export default function DirectoryView({
  books,
  wishlistIds,
  readingMap,
  completedMap,
  apiKey,
  onSelectBook,
  onToggleWishlist,
  onStartReading,
  onOpenSection,
  onOpenAddModal,
  onOpenApiKeyModal,
}) {
  const [query, setQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');

  const [apiResults, setApiResults] = useState([]);
  const [isSearchingApi, setIsSearchingApi] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [searchedQuery, setSearchedQuery] = useState('');
  const [retryToken, setRetryToken] = useState(0);

  const trimmedQuery = query.trim();
  const isSearchActive = trimmedQuery.length >= 2;

  useEffect(() => {
    if (!isSearchActive) {
      setApiResults([]);
      setApiError(null);
      setIsSearchingApi(false);
      setSearchedQuery('');
      return undefined;
    }

    const controller = new AbortController();
    setIsSearchingApi(true);
    setApiError(null);

    const timerId = window.setTimeout(async () => {
      try {
        const results = await searchGoogleBooks(trimmedQuery, {
          apiKey,
          signal: controller.signal,
          maxResults: 12,
        });
        if (!controller.signal.aborted) {
          setApiResults(results);
          setSearchedQuery(trimmedQuery);
          setIsSearchingApi(false);
        }
      } catch (err) {
        if (err?.name === 'AbortError') return;
        setApiResults([]);
        setSearchedQuery(trimmedQuery);
        setApiError(err);
        setIsSearchingApi(false);
      }
    }, 420);

    return () => {
      window.clearTimeout(timerId);
      controller.abort();
    };
  }, [trimmedQuery, isSearchActive, apiKey, retryToken]);

  const handleInstantSearch = (e) => {
    e.preventDefault();
    if (trimmedQuery.length >= 2) {
      setRetryToken((n) => n + 1);
    }
  };

  const availableGenres = useMemo(() => {
    const base = new Set(GENRES);
    books.forEach((b) => {
      if (b.genre) base.add(b.genre);
    });
    return Array.from(base);
  }, [books]);

  const localFilteredBooks = useMemo(() => {
    const q = trimmedQuery.toLowerCase();
    return books.filter((book) => {
      const matchesGenre =
        isSearchActive || selectedGenre === 'All' || book.genre === selectedGenre;
      if (!matchesGenre) return false;
      if (!q) return true;
      return (
        book.title.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q) ||
        book.synopsis.toLowerCase().includes(q) ||
        book.genre.toLowerCase().includes(q)
      );
    });
  }, [books, trimmedQuery, selectedGenre, isSearchActive]);

  // Keep local copies authoritative if a Google Books volume is already in state.books
  const mergedApiResults = useMemo(() => {
    const byId = new Map(books.map((b) => [b.id, b]));
    return apiResults.map((item) => byId.get(item.id) || item);
  }, [apiResults, books]);

  return (
    <section className="page-section" aria-labelledby="directory-heading">
      <div className="page-header">
        <div>
          <span className="eyebrow-label">Google Books Search &amp; Library</span>
          <h1 id="directory-heading" className="page-title">
            Book Directory
          </h1>
          <p className="page-subtitle">
            Search any title or author in real time via Google Books, or browse your curated library below.
          </p>
        </div>

        <div className="page-header__actions">
          <button
            type="button"
            id="open-api-key-btn"
            className="btn btn--ghost btn--sm"
            onClick={onOpenApiKeyModal}
            title="Configure optional Google Books API key"
          >
            <span>{apiKey ? 'API Key Set' : 'API Key'}</span>
          </button>

          <button
            type="button"
            id="open-add-book-btn"
            className="btn btn--primary"
            onClick={onOpenAddModal}
          >
            <PlusIcon size={16} />
            <span>Add Custom</span>
          </button>
        </div>
      </div>

      <div className="directory-controls">
        <form className="search-bar-row" onSubmit={handleInstantSearch} role="search">
          <div className="search-field">
            <SearchIcon size={16} />
            <input
              id="directory-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search books or authors via Google Books..."
              aria-label="Search any book or author via Google Books"
            />
            {query && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setQuery('')}
                aria-label="Clear search query"
              >
                <CloseIcon size={14} />
              </button>
            )}
          </div>
          <button
            type="submit"
            id="directory-search-submit"
            className="btn btn--violet-soft"
            disabled={trimmedQuery.length < 2}
          >
            Search
          </button>
        </form>

        {!isSearchActive ? (
          <div className="search-suggestions">
            <span className="search-suggestions__label">Try Google Books:</span>
            {SUGGESTED_QUERIES.map((term) => (
              <button
                key={term}
                type="button"
                className="quick-chip"
                onClick={() => setQuery(term)}
              >
                {term}
              </button>
            ))}
          </div>
        ) : null}

        {!isSearchActive && (
          <div className="genre-strip" role="tablist" aria-label="Filter saved library by genre">
            {availableGenres.map((genre) => (
              <button
                key={genre}
                type="button"
                role="tab"
                aria-selected={selectedGenre === genre}
                className={`filter-chip ${selectedGenre === genre ? 'is-active' : ''}`}
                onClick={() => setSelectedGenre(genre)}
              >
                {genre}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Real-time Google Books Search Results Section */}
      {isSearchActive && (
        <div className="directory-subsection" aria-live="polite">
          <div className="subsection-head">
            <h2 className="subsection-title">
              Google Books Results
              {searchedQuery && !isSearchingApi && !apiError
                ? ` for “${searchedQuery}”`
                : ''}
            </h2>
            {!isSearchingApi && !apiError && (
              <span className="subsection-count mono-num">
                {mergedApiResults.length}{' '}
                {mergedApiResults.length === 1 ? 'volume' : 'volumes'}
              </span>
            )}
          </div>

          {isSearchingApi ? (
            <div className="book-grid" aria-label="Searching Google Books">
              {[1, 2, 3, 4].map((skeleton) => (
                <div key={skeleton} className="book-card book-card--skeleton" aria-hidden="true">
                  <div className="skeleton-cover" />
                  <div className="skeleton-lines">
                    <div className="skeleton-line skeleton-line--sm" />
                    <div className="skeleton-line skeleton-line--lg" />
                    <div className="skeleton-line skeleton-line--md" />
                    <div className="skeleton-line skeleton-line--full" />
                  </div>
                </div>
              ))}
            </div>
          ) : apiError ? (
            <div className="api-notice" role="alert">
              <div>
                <p className="api-notice__title">Google Books request could not complete</p>
                <p className="api-notice__msg">{apiError.message}</p>
              </div>
              <div className="api-notice__actions">
                <button
                  type="button"
                  className="btn btn--violet-outline btn--sm"
                  onClick={onOpenApiKeyModal}
                >
                  Configure API Key
                </button>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => setRetryToken((n) => n + 1)}
                >
                  Retry
                </button>
              </div>
            </div>
          ) : mergedApiResults.length === 0 ? (
            <div className="empty-state empty-state--compact">
              <p className="empty-state__title">No Google Books matches for “{searchedQuery}”</p>
              <p className="empty-state__desc">
                Try refining the title or author name, or add the book manually.
              </p>
            </div>
          ) : (
            <div className="book-grid">
              {mergedApiResults.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  isWishlisted={wishlistIds.includes(book.id)}
                  readingEntry={readingMap[book.id]}
                  completedEntry={completedMap[book.id]}
                  onSelectBook={onSelectBook}
                  onToggleWishlist={onToggleWishlist}
                  onStartReading={onStartReading}
                  onOpenSection={onOpenSection}
                  badgeLabel="Google Books"
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Curated & Saved Local Library */}
      <div className="directory-subsection">
        {(isSearchActive || localFilteredBooks.length > 0) && (
          <div className="subsection-head">
            <h2 className="subsection-title">
              {isSearchActive ? 'Matching Books in Your Library' : 'Your Library & Curated Shelf'}
            </h2>
            <span className="subsection-count mono-num">
              {localFilteredBooks.length}{' '}
              {localFilteredBooks.length === 1 ? 'book' : 'books'}
            </span>
          </div>
        )}

        {localFilteredBooks.length === 0 ? (
          !isSearchActive && (
            <div className="empty-state">
              <p className="empty-state__title">No books in this genre yet</p>
              <p className="empty-state__desc">
                Search Google Books above to add titles or reset the genre filter.
              </p>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => {
                  setQuery('');
                  setSelectedGenre('All');
                }}
              >
                Show All Genres
              </button>
            </div>
          )
        ) : (
          <div className="book-grid">
            {localFilteredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                isWishlisted={wishlistIds.includes(book.id)}
                readingEntry={readingMap[book.id]}
                completedEntry={completedMap[book.id]}
                onSelectBook={onSelectBook}
                onToggleWishlist={onToggleWishlist}
                onStartReading={onStartReading}
                onOpenSection={onOpenSection}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
