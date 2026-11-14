import { translateGenre } from '../data/genres';
import { translate } from '../i18n/translations';
import BookCover from './BookCover';
import { ArrowRightIcon, BookmarkIcon, BookOpenIcon, CloseIcon } from './Icons';

export default function WishlistView({
  books,
  wishlistIds,
  lang,
  onToggleWishlist,
  onStartReading,
  onSelectBook,
  onBrowseDirectory,
}) {
  const t = (key, vars) => translate(lang, key, vars);
  const wishlistedBooks = books.filter((book) => wishlistIds.includes(book.id));

  const savedLabel =
    wishlistedBooks.length === 1
      ? t('wishSavedSingle')
      : t('wishSavedPlural', { count: wishlistedBooks.length });

  return (
    <section className="page-section" aria-labelledby="wishlist-heading">
      <div className="page-header">
        <div>
          <span className="eyebrow-label">{t('wishEyebrow')}</span>
          <h1 id="wishlist-heading" className="page-title">
            {t('wishTitle')}
          </h1>
          <p className="page-subtitle">{t('wishSubtitle')}</p>
        </div>

        <span className="header-stat-pill">
          <BookmarkIcon filled size={14} />
          <span>{savedLabel}</span>
        </span>
      </div>

      {wishlistedBooks.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state__title">{t('wishEmptyTitle')}</p>
          <p className="empty-state__desc">{t('wishEmptyDesc')}</p>
          <button
            type="button"
            className="btn btn--primary"
            onClick={onBrowseDirectory}
          >
            <span>{t('wishBrowseBtn')}</span>
            <ArrowRightIcon size={15} />
          </button>
        </div>
      ) : (
        <div className="wishlist-list">
          {wishlistedBooks.map((book) => (
            <article key={book.id} className="wishlist-item" data-book-id={book.id}>
              <button
                type="button"
                className="wishlist-item__cover-btn"
                onClick={() => onSelectBook(book)}
                aria-label={book.title}
              >
                <BookCover book={book} size="md" lang={lang} />
              </button>

              <div className="wishlist-item__content">
                <div className="wishlist-item__meta">
                  <span>{translateGenre(book.genre, lang)}</span>
                  {book.year && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>{book.year}</span>
                    </>
                  )}
                  <span aria-hidden="true">·</span>
                  <span className="mono-num">
                    {book.totalPages
                      ? t('pagesCount', { count: book.totalPages })
                      : t('pageCountMissingShort')}
                  </span>
                </div>

                <h2 className="wishlist-item__title">
                  <button
                    type="button"
                    className="book-card__title-btn"
                    onClick={() => onSelectBook(book)}
                  >
                    {book.title}
                  </button>
                </h2>
                <p className="wishlist-item__author">{t('byAuthor', { author: book.author })}</p>
                <p className="wishlist-item__synopsis">{book.synopsis || t('noSynopsis')}</p>

                <div className="wishlist-item__actions">
                  <button
                    type="button"
                    id={`wishlist-start-${book.id}`}
                    className="btn btn--primary btn--sm"
                    onClick={() => onStartReading(book)}
                  >
                    <BookOpenIcon size={15} />
                    <span>{t('actStartReading')}</span>
                  </button>

                  <button
                    type="button"
                    id={`wishlist-remove-${book.id}`}
                    className="btn btn--ghost btn--sm"
                    onClick={() => onToggleWishlist(book)}
                  >
                    <CloseIcon size={14} />
                    <span>{t('actRemove')}</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
