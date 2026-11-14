import { useEffect, useState } from 'react';
import { translateGenre } from '../data/genres';
import { translate } from '../i18n/translations';

/**
 * Renders a 2:3 book cover image with subtle hardcover spine highlight,
 * falling back to a minimalist editorial clothbound typographic cover
 * when an image is unavailable or fails to load.
 */
export default function BookCover({ book, size = 'md', className = '', lang = 'en' }) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [book.cover]);

  const showImage = Boolean(book.cover) && !imgError;
  const coverAlt = translate(lang, 'coverOf', { title: book.title });

  return (
    <div className={`book-cover book-cover--${size} ${className}`}>
      {showImage ? (
        <img
          src={book.cover}
          alt={coverAlt}
          loading="lazy"
          onError={() => setImgError(true)}
          className="book-cover__img"
        />
      ) : (
        <div className="book-cover__fallback" aria-label={coverAlt}>
          <span className="book-cover__fallback-genre">
            {translateGenre(book.genre, lang)}
          </span>
          <span className="book-cover__fallback-title">{book.title}</span>
          <span className="book-cover__fallback-author">{book.author}</span>
        </div>
      )}
      <span className="book-cover__spine" aria-hidden="true" />
    </div>
  );
}
