import BookCover from './BookCover';
import { ArrowRightIcon, BookmarkIcon, BookOpenIcon, CloseIcon } from './Icons';

export default function WishlistView({
  books,
  wishlistIds,
  onToggleWishlist,
  onStartReading,
  onSelectBook,
  onBrowseDirectory,
}) {
  const wishlistedBooks = books.filter((book) => wishlistIds.includes(book.id));

  return (
    <section className="page-section" aria-labelledby="wishlist-heading">
      <div className="page-header">
        <div>
          <span className="eyebrow-label">Saved Queue</span>
          <h1 id="wishlist-heading" className="page-title">
            Reading Wishlist
          </h1>
          <p className="page-subtitle">
            Books you intend to read next. Start any book when you are ready to open its first page.
          </p>
        </div>

        <span className="header-stat-pill">
          <BookmarkIcon filled size={14} />
          <span className="mono-num">{wishlistedBooks.length}</span>
          <span>{wishlistedBooks.length === 1 ? 'book saved' : 'books saved'}</span>
        </span>
      </div>

      {wishlistedBooks.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state__title">Your wishlist is quiet for now</p>
          <p className="empty-state__desc">
            Explore the book directory and bookmark titles that catch your curiosity.
          </p>
          <button
            type="button"
            className="btn btn--primary"
            onClick={onBrowseDirectory}
          >
            <span>Browse Directory</span>
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
                aria-label={`View ${book.title}`}
              >
                <BookCover book={book} size="md" />
              </button>

              <div className="wishlist-item__content">
                <div className="wishlist-item__meta">
                  <span>{book.genre}</span>
                  {book.year && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>{book.year}</span>
                    </>
                  )}
                  <span aria-hidden="true">·</span>
                  <span className="mono-num">
                    {book.totalPages ? `${book.totalPages} pages` : 'Page count N/A'}
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
                <p className="wishlist-item__author">by {book.author}</p>
                <p className="wishlist-item__synopsis">{book.synopsis}</p>

                <div className="wishlist-item__actions">
                  <button
                    type="button"
                    id={`wishlist-start-${book.id}`}
                    className="btn btn--primary btn--sm"
                    onClick={() => onStartReading(book)}
                  >
                    <BookOpenIcon size={15} />
                    <span>Start Reading</span>
                  </button>

                  <button
                    type="button"
                    id={`wishlist-remove-${book.id}`}
                    className="btn btn--ghost btn--sm"
                    onClick={() => onToggleWishlist(book)}
                  >
                    <CloseIcon size={14} />
                    <span>Remove</span>
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
