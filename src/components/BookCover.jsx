import { useEffect, useState } from 'react';

/**
 * Renders a 2:3 book cover image with subtle hardcover spine highlight,
 * falling back to a minimalist editorial cloth-bound typographic cover
 * for custom books without an image URL or if an external image fails.
 */
export default function BookCover({ book, size = 'md', className = '' }) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [book.cover]);

  const showImage = Boolean(book.cover) && !imgError;

  return (
    <div className={`book-cover book-cover--${size} ${className}`}>
      {showImage ? (
        <img
          src={book.cover}
          alt={`Cover of ${book.title}`}
          loading="lazy"
          onError={() => setImgError(true)}
          className="book-cover__img"
        />
      ) : (
        <div className="book-cover__fallback" aria-label={`Cover of ${book.title}`}>
          <span className="book-cover__fallback-genre">{book.genre}</span>
          <span className="book-cover__fallback-title">{book.title}</span>
          <span className="book-cover__fallback-author">{book.author}</span>
        </div>
      )}
      <span className="book-cover__spine" aria-hidden="true" />
    </div>
  );
}
