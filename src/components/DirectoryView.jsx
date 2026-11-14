import { useEffect, useMemo, useState } from 'react';
import { translateGenre } from '../data/genres';
import { translate } from '../i18n/translations';
import { searchBooksCatalog } from '../services/googleBooks';
import { getCompletionPercentage } from '../utils/formatters';
import BookCover from './BookCover';
import {
  BookmarkIcon,
  BookOpenIcon,
  CheckCircleIcon,
  CloseIcon,
  PlusIcon,
  SearchIcon,
} from './Icons';

function BookCard({
  book,
  isWishlisted,
  readingEntry,
  completedEntry,
  lang,
  onSelectBook,
  onToggleWishlist,
  onStartReading,
  onOpenSection,
}) {
  const t = (key, vars) => translate(lang, key, vars);
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
          aria-label={book.title}
        >
          <BookCover book={book} size="md" lang={lang} />
        </button>

        <div className="book-card__info">
          <div className="book-card__meta">
            <span>{translateGenre(book.genre, lang)}</span>
            <span aria-hidden="true">·</span>
            <span className="mono-num">
              {book.totalPages
                ? t('pagesShort', { count: book.totalPages })
                : t('pagesUnknown')}
            </span>
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

          <p className="book-card__synopsis">{book.synopsis || t('noSynopsis')}</p>
        </div>
      </div>

      {readingEntry && (
        <div className="book-card__progress">
          <div className="book-card__progress-labels">
            <span>{t('navReading')}</span>
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
            <span>{t('actContinue', { pct: progressPct })}</span>
          </button>
        ) : completedEntry ? (
          <button
            type="button"
            className="btn btn--sage-soft btn--sm"
            onClick={() => onOpenSection('completed', book.id)}
          >
            <CheckCircleIcon size={14} />
            <span>{t('actCompleted')}</span>
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
              <span>{isWishlisted ? t('actWishlisted') : t('actWishlist')}</span>
            </button>

            <button
              type="button"
              id={`start-reading-${book.id}`}
              className="btn btn--violet-soft btn--sm"
              onClick={() => onStartReading(book)}
            >
              <BookOpenIcon size={14} />
              <span>{t('actRead')}</span>
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
  lang,
  onSelectBook,
  onToggleWishlist,
  onStartReading,
  onOpenSection,
  onOpenAddModal,
}) {
  const [query, setQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');

  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFailed, setSearchFailed] = useState(false);
  const [searchedQuery, setSearchedQuery] = useState('');
  const [retryToken, setRetryToken] = useState(0);

  const t = (key, vars) => translate(lang, key, vars);
  const trimmedQuery = query.trim();
  const isSearchActive = trimmedQuery.length >= 2;

  useEffect(() => {
    if (!isSearchActive) {
      setSearchResults([]);
      setSearchFailed(false);
      setIsSearching(false);
      setSearchedQuery('');
      return undefined;
    }

    const controller = new AbortController();
    setIsSearching(true);
    setSearchFailed(false);

    const timerId = window.setTimeout(async () => {
      try {
        const results = await searchBooksCatalog(trimmedQuery, {
          signal: controller.signal,
        });
        if (!controller.signal.aborted) {
          setSearchResults(results);
          setSearchedQuery(trimmedQuery);
          setIsSearching(false);
        }
      } catch (err) {
        if (err?.name === 'AbortError') return;
        setSearchResults([]);
        setSearchedQuery(trimmedQuery);
        setSearchFailed(true);
        setIsSearching(false);
      }
    }, 420);

    return () => {
      window.clearTimeout(timerId);
      controller.abort();
    };
  }, [trimmedQuery, isSearchActive, retryToken]);

  const handleInstantSearch = (e) => {
    e.preventDefault();
    if (trimmedQuery.length >= 2) {
      setRetryToken((n) => n + 1);
    }
  };

  const savedGenres = useMemo(() => {
    const set = new Set(['All']);
    books.forEach((b) => {
      if (b.genre) set.add(b.genre);
    });
    return Array.from(set);
  }, [books]);

  const activeGenreFilter = savedGenres.includes(selectedGenre) ? selectedGenre : 'All';

  const localFilteredBooks = useMemo(() => {
    const q = trimmedQuery.toLowerCase();
    return books.filter((book) => {
      const matchesGenre =
        isSearchActive || activeGenreFilter === 'All' || book.genre === activeGenreFilter;
      if (!matchesGenre) return false;
      if (!q) return true;
      return (
        book.title.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q) ||
        (book.synopsis || '').toLowerCase().includes(q) ||
        (book.genre || '').toLowerCase().includes(q)
      );
    });
  }, [books, trimmedQuery, activeGenreFilter, isSearchActive]);

  const mergedResults = useMemo(() => {
    const byId = new Map(books.map((b) => [b.id, b]));
    return searchResults.map((item) => byId.get(item.id) || item);
  }, [searchResults, books]);

  const resultCountLabel =
    mergedResults.length === 1
      ? t('dirResultCountSingle')
      : t('dirResultCountPlural', { count: mergedResults.length });

  const localCountLabel =
    localFilteredBooks.length === 1
      ? t('dirBookCountSingle')
      : t('dirBookCountPlural', { count: localFilteredBooks.length });

  return (
    <section className="page-section" aria-labelledby="directory-heading">
      <div className="page-header">
        <div>
          <span className="eyebrow-label">{t('dirEyebrow')}</span>
          <h1 id="directory-heading" className="page-title">
            {t('dirTitle')}
          </h1>
          <p className="page-subtitle">{t('dirSubtitle')}</p>
        </div>

        <div className="page-header__actions">
          <button
            type="button"
            id="open-add-book-btn"
            className="btn btn--primary"
            onClick={onOpenAddModal}
          >
            <PlusIcon size={16} />
            <span>{t('dirAddCustom')}</span>
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
              placeholder={t('dirSearchPlaceholder')}
              aria-label={t('dirSearchPlaceholder')}
            />
            {query && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setQuery('')}
                aria-label={t('dirClearSearch')}
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
            {t('dirSearchBtn')}
          </button>
        </form>

        {!isSearchActive && savedGenres.length > 1 && (
          <div className="genre-strip" role="tablist" aria-label={t('addBookGenreLabel')}>
            {savedGenres.map((genre) => (
              <button
                key={genre}
                type="button"
                role="tab"
                aria-selected={activeGenreFilter === genre}
                className={`filter-chip ${activeGenreFilter === genre ? 'is-active' : ''}`}
                onClick={() => setSelectedGenre(genre)}
              >
                {genre === 'All' ? t('allGenres') : translateGenre(genre, lang)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Live Search Results */}
      {isSearchActive && (
        <div className="directory-subsection" aria-live="polite">
          <div className="subsection-head">
            <h2 className="subsection-title">
              {searchedQuery && !isSearching && !searchFailed
                ? t('dirSearchResultsFor', { query: searchedQuery })
                : t('dirSearchResults')}
            </h2>
            {!isSearching && !searchFailed && (
              <span className="subsection-count mono-num">{resultCountLabel}</span>
            )}
          </div>

          {isSearching ? (
            <div className="book-grid">
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
          ) : searchFailed ? (
            <div className="search-notice" role="alert">
              <div>
                <p className="search-notice__title">{t('dirSearchErrorTitle')}</p>
                <p className="search-notice__msg">{t('dirSearchErrorMsg')}</p>
              </div>
              <div className="search-notice__actions">
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => setRetryToken((n) => n + 1)}
                >
                  {t('retry')}
                </button>
              </div>
            </div>
          ) : mergedResults.length === 0 ? (
            <div className="empty-state empty-state--compact">
              <p className="empty-state__title">
                {t('dirNoResultsTitle', { query: searchedQuery })}
              </p>
              <p className="empty-state__desc">{t('dirNoResultsDesc')}</p>
            </div>
          ) : (
            <div className="book-grid">
              {mergedResults.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  isWishlisted={wishlistIds.includes(book.id)}
                  readingEntry={readingMap[book.id]}
                  completedEntry={completedMap[book.id]}
                  lang={lang}
                  onSelectBook={onSelectBook}
                  onToggleWishlist={onToggleWishlist}
                  onStartReading={onStartReading}
                  onOpenSection={onOpenSection}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* User's Saved Library */}
      <div className="directory-subsection">
        {(isSearchActive || books.length > 0) && (
          <div className="subsection-head">
            <h2 className="subsection-title">
              {isSearchActive ? t('dirMatchingSaved') : t('dirYourShelf')}
            </h2>
            <span className="subsection-count mono-num">{localCountLabel}</span>
          </div>
        )}

        {localFilteredBooks.length === 0 ? (
          !isSearchActive && (
            <div className="empty-state">
              <p className="empty-state__title">
                {books.length === 0 ? t('dirEmptyTitle') : t('dirNoGenreTitle')}
              </p>
              <p className="empty-state__desc">
                {books.length === 0 ? t('dirEmptyDesc') : t('dirNoGenreDesc')}
              </p>
              {books.length === 0 ? (
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={onOpenAddModal}
                >
                  <PlusIcon size={16} />
                  <span>{t('dirAddCustom')}</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => {
                    setQuery('');
                    setSelectedGenre('All');
                  }}
                >
                  {t('dirResetFilter')}
                </button>
              )}
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
                lang={lang}
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
