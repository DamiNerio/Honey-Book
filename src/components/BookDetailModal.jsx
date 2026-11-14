import { useEffect } from 'react';
import { translateGenre } from '../data/genres';
import { translate } from '../i18n/translations';
import { formatDuration, getCompletionPercentage } from '../utils/formatters';
import BookCover from './BookCover';
import {
  BookmarkIcon,
  BookOpenIcon,
  CheckCircleIcon,
  ClockIcon,
  CloseIcon,
} from './Icons';

export default function BookDetailModal({
  book,
  isWishlisted,
  readingEntry,
  completedEntry,
  lang,
  onClose,
  onToggleWishlist,
  onStartReading,
  onOpenSection,
}) {
  const t = (key, vars) => translate(lang, key, vars);

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
          aria-label={t('close')}
        >
          <CloseIcon size={18} />
        </button>

        <div className="detail-layout">
          <div className="detail-layout__media">
            <BookCover book={book} size="lg" lang={lang} />
          </div>

          <div className="detail-layout__body">
            <div className="detail-meta-row">
              <span className="meta-tag">{translateGenre(book.genre, lang)}</span>
              {book.year && (
                <>
                  <span className="meta-dot" aria-hidden="true">·</span>
                  <span>{book.year}</span>
                </>
              )}
              <span className="meta-dot" aria-hidden="true">·</span>
              <span className="mono-num">
                {book.totalPages
                  ? t('pagesCount', { count: book.totalPages })
                  : t('pageCountMissingShort')}
              </span>
            </div>

            <h2 id="detail-modal-title" className="detail-title">
              {book.title}
            </h2>
            <p className="detail-author">{t('byAuthor', { author: book.author })}</p>

            <div className="detail-synopsis">
              <span className="eyebrow-label">{t('synopsis')}</span>
              <p>{book.synopsis || t('noSynopsis')}</p>
            </div>

            {isReading && (
              <div className="detail-status-box">
                <div className="detail-status-box__top">
                  <span>{t('navReading')}</span>
                  <span className="mono-num">
                    {readingEntry.currentPage} / {book.totalPages} ({progressPct}%)
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
                    {t('actCompleted')}
                  </span>
                  <span className="mono-num inline-flex-center">
                    <ClockIcon size={14} />
                    {formatDuration(completedEntry.totalReadingSeconds)}
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
                  <span>{t('actContinueReading')}</span>
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
                  <span>{t('actViewCompleted')}</span>
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
                  <span>{t('actStartReading')}</span>
                </button>
              )}

              {!isCompleted && !isReading && (
                <button
                  type="button"
                  className={`btn ${isWishlisted ? 'btn--violet-outline' : 'btn--ghost'}`}
                  onClick={() => onToggleWishlist(book)}
                >
                  <BookmarkIcon filled={isWishlisted} size={15} />
                  <span>{isWishlisted ? t('actInWishlist') : t('actAddToWishlist')}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
