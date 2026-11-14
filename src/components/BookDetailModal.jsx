import { useEffect } from 'react';
import BookCover from './BookCover';
import {
  BookmarkIcon,
  BookOpenIcon,
  CheckCircleIcon,
  ClockIcon,
  CloseIcon,
} from './Icons';
import { formatDuration, getCompletionPercentage } from '../utils/formatters';

export default function BookDetailModal({
  book,
  isWishlisted,
  readingEntry,
  completedEntry,
  onClose,
  onToggleWishlist,
  onStartReading,
  onOpenSection,
}) {
  useEffect(() => {
    if (!book) return undefined;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [book, onClose]);

  if (!book) return null;

  const isReading = Boolean(readingEntry);
  const isCompleted = Boolean(completedEntry);
  const progressPct =
    isReading && book.totalPages
      ? getCompletionPercentage(readingEntry.currentPage, book.totalPages)
      : 0;

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-modal-title"
      onClick={onClose}
    >
      <div className="modal-panel modal-panel--detail" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          id="detail-modal-close"
          className="modal-close"
          onClick={onClose}
          aria-label="Close book details"
        >
          <CloseIcon size={18} />
        </button>

        <div className="detail-layout">
          <div className="detail-layout__media">
            <BookCover book={book} size="lg" />
          </div>

          <div className="detail-layout__body">
            <div className="detail-meta-row">
              <span className="meta-tag">{book.genre}</span>
              {book.year && (
                <>
                  <span className="meta-dot" aria-hidden="true">·</span>
                  <span>{book.year}</span>
                </>
              )}
              <span className="meta-dot" aria-hidden="true">·</span>
              <span className="mono-num">
                {book.totalPages ? `${book.totalPages} pages` : 'Page count N/A'}
              </span>
            </div>

            <h2 id="detail-modal-title" className="detail-title">
              {book.title}
            </h2>
            <p className="detail-author">by {book.author}</p>

            <div className="detail-synopsis">
              <span className="eyebrow-label">Synopsis</span>
              <p>{book.synopsis}</p>
            </div>

            {isReading && (
              <div className="detail-status-box">
                <div className="detail-status-box__top">
                  <span>Currently Reading</span>
                  <span className="mono-num">
                    {readingEntry.currentPage} / {book.totalPages} pages ({progressPct}%)
                  </span>
                </div>
                <div className="progress-track">
                  <div className="progress-track__fill" style={{ width: `${progressPct}%` }} />
                </div>
              </div>
            )}

            {isCompleted && (
              <div className="detail-status-box detail-status-box--complete">
                <div className="detail-status-box__top">
                  <span className="inline-flex-center">
                    <CheckCircleIcon size={15} />
                    Completed
                  </span>
                  <span className="mono-num inline-flex-center">
                    <ClockIcon size={14} />
                    {formatDuration(completedEntry.totalReadingSeconds)} total
                  </span>
                </div>
              </div>
            )}

            <div className="detail-actions">
              {isReading ? (
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={() => {
                    onOpenSection('reading', book.id);
                    onClose();
                  }}
                >
                  <BookOpenIcon size={16} />
                  <span>Continue Reading</span>
                </button>
              ) : isCompleted ? (
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={() => {
                    onOpenSection('completed', book.id);
                    onClose();
                  }}
                >
                  <CheckCircleIcon size={16} />
                  <span>View in Completed</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={() => {
                    onClose();
                    onStartReading(book);
                  }}
                >
                  <BookOpenIcon size={16} />
                  <span>Start Reading</span>
                </button>
              )}

              {!isCompleted && !isReading && (
                <button
                  type="button"
                  className={`btn ${isWishlisted ? 'btn--violet-outline' : 'btn--ghost'}`}
                  onClick={() => onToggleWishlist(book)}
                >
                  <BookmarkIcon filled={isWishlisted} size={15} />
                  <span>{isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
