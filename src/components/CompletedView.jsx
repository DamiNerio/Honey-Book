import { useState } from 'react';
import { translate } from '../i18n/translations';
import { formatDateShort, formatDuration } from '../utils/formatters';
import BookCover from './BookCover';
import {
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon,
  EditIcon,
} from './Icons';

function CompletedBookCard({
  book,
  record,
  lang,
  onSaveReview,
  onSelectBook,
}) {
  const t = (key, vars) => translate(lang, key, vars);
  const [isEditing, setIsEditing] = useState(!record.review);
  const [draftReview, setDraftReview] = useState(record.review || '');
  const [draftRating, setDraftRating] = useState(record.rating || 0);
  const [showSessions, setShowSessions] = useState(false);

  const sessionWord =
    record.sessionsCount === 1 ? t('sessionSingle') : t('sessionPlural');

  const handleSave = (e) => {
    e.preventDefault();
    onSaveReview(book.id, draftReview.trim(), draftRating);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraftReview(record.review || '');
    setDraftRating(record.rating || 0);
    setIsEditing(false);
  };

  return (
    <article className="completed-card" data-book-id={book.id}>
      <div className="completed-card__main">
        <button
          type="button"
          className="completed-card__cover-btn"
          onClick={() => onSelectBook(book)}
          aria-label={book.title}
        >
          <BookCover book={book} size="md" lang={lang} />
        </button>

        <div className="completed-card__body">
          <div className="completed-card__header">
            <div>
              <div className="completed-card__meta">
                <span className="completed-badge">
                  <CheckCircleIcon size={13} />
                  <span>
                    {t('compDateLabel', { date: formatDateShort(record.completedAt, lang) })}
                  </span>
                </span>
                <span className="meta-dot" aria-hidden="true">·</span>
                <span className="mono-num">
                  {t('pagesCount', { count: book.totalPages })}
                </span>
              </div>

              <h2 className="completed-card__title">
                <button
                  type="button"
                  className="book-card__title-btn"
                  onClick={() => onSelectBook(book)}
                >
                  {book.title}
                </button>
              </h2>
              <p className="completed-card__author">{t('byAuthor', { author: book.author })}</p>
            </div>

            <div className="completed-time-stat">
              <span className="eyebrow-label">{t('compTotalTimeLabel')}</span>
              <div className="completed-time-stat__value mono-num">
                <ClockIcon size={16} />
                <span>{formatDuration(record.totalReadingSeconds)}</span>
              </div>
              <span className="completed-time-stat__sub mono-num">
                {t('readAcrossSessions', {
                  count: record.sessionsCount,
                  unit: sessionWord,
                })}
              </span>
            </div>
          </div>

          <div className="review-block">
            <div className="review-block__head">
              <span className="eyebrow-label">{t('compReviewLabel')}</span>
              {!isEditing && (
                <button
                  type="button"
                  id={`edit-review-${book.id}`}
                  className="text-link-btn"
                  onClick={() => {
                    setDraftReview(record.review || '');
                    setDraftRating(record.rating || 0);
                    setIsEditing(true);
                  }}
                >
                  <EditIcon size={13} />
                  <span>{record.review ? t('compEditThoughts') : t('compWriteReview')}</span>
                </button>
              )}
            </div>

            {isEditing ? (
              <form className="review-form" onSubmit={handleSave}>
                <div className="rating-row" aria-label={t('compImpression')}>
                  <span className="rating-row__label">{t('compImpression')}</span>
                  <div className="rating-diamonds">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        className={`rating-star ${draftRating >= value ? 'is-filled' : ''}`}
                        onClick={() => setDraftRating(draftRating === value ? 0 : value)}
                        aria-label={t('compRateAria', { value })}
                        aria-pressed={draftRating >= value}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  id={`review-textarea-${book.id}`}
                  rows="3"
                  value={draftReview}
                  onChange={(e) => setDraftReview(e.target.value)}
                  placeholder={t('compReviewPlaceholder')}
                  className="review-textarea"
                />

                <div className="review-form__actions">
                  {record.review && (
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      onClick={handleCancel}
                    >
                      {t('cancel')}
                    </button>
                  )}
                  <button
                    type="submit"
                    id={`save-review-${book.id}`}
                    className="btn btn--primary btn--sm"
                  >
                    {t('compSaveThoughts')}
                  </button>
                </div>
              </form>
            ) : (
              <div className="review-display">
                {record.rating > 0 && (
                  <div className="rating-display">
                    {[1, 2, 3, 4, 5].map((v) => (
                      <span
                        key={v}
                        className={`rating-star-static ${record.rating >= v ? 'is-filled' : ''}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                )}
                {record.review ? (
                  <blockquote className="review-quote">{record.review}</blockquote>
                ) : (
                  <p className="review-empty">{t('compNoReflections')}</p>
                )}
              </div>
            )}
          </div>

          {record.sessions && record.sessions.length > 0 && (
            <div className="completed-sessions-toggle">
              <button
                type="button"
                className="text-link-btn"
                onClick={() => setShowSessions((v) => !v)}
              >
                {showSessions
                  ? t('compHideSessions')
                  : t('compShowSessions', {
                      count: record.sessions.length,
                      unit:
                        record.sessions.length === 1
                          ? t('sessionSingle')
                          : t('sessionPlural'),
                    })}
              </button>

              {showSessions && (
                <div className="sessions-list sessions-list--compact">
                  {record.sessions.map((s, idx) => (
                    <div key={s.id} className="session-row">
                      <div className="session-row__left">
                        <span className="session-row__index mono-num">#{idx + 1}</span>
                        <span className="session-row__date">
                          {formatDateShort(s.timestamp, lang)}
                        </span>
                      </div>
                      <div className="session-row__pages mono-num">
                        {t('sessionPageArrow', { start: s.startPage, end: s.endPage })}
                      </div>
                      <div className="session-row__duration mono-num">
                        {formatDuration(s.durationSeconds)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default function CompletedView({
  books,
  completedMap,
  lang,
  onSaveReview,
  onSelectBook,
  onBrowseDirectory,
}) {
  const t = (key, vars) => translate(lang, key, vars);

  const completedItems = books
    .filter((book) => Boolean(completedMap[book.id]))
    .map((book) => ({ book, record: completedMap[book.id] }))
    .sort(
      (a, b) =>
        new Date(b.record.completedAt).getTime() - new Date(a.record.completedAt).getTime()
    );

  const totalHoursSeconds = completedItems.reduce(
    (sum, item) => sum + (item.record.totalReadingSeconds || 0),
    0
  );

  return (
    <section className="page-section" aria-labelledby="completed-heading">
      <div className="page-header">
        <div>
          <span className="eyebrow-label">{t('compEyebrow')}</span>
          <h1 id="completed-heading" className="page-title">
            {t('compTitle')}
          </h1>
          <p className="page-subtitle">{t('compSubtitle')}</p>
        </div>

        <span className="header-stat-pill">
          <ClockIcon size={14} />
          <span>
            {t(completedItems.length === 1 ? 'compSummaryStatSingle' : 'compSummaryStat', {
              time: formatDuration(totalHoursSeconds),
              count: completedItems.length,
            })}
          </span>
        </span>
      </div>

      {completedItems.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state__title">{t('compEmptyTitle')}</p>
          <p className="empty-state__desc">{t('compEmptyDesc')}</p>
          <button type="button" className="btn btn--primary" onClick={onBrowseDirectory}>
            <span>{t('compStartBook')}</span>
            <ArrowRightIcon size={15} />
          </button>
        </div>
      ) : (
        <div className="completed-list">
          {completedItems.map(({ book, record }) => (
            <CompletedBookCard
              key={book.id}
              book={book}
              record={record}
              lang={lang}
              onSaveReview={onSaveReview}
              onSelectBook={onSelectBook}
            />
          ))}
        </div>
      )}
    </section>
  );
}
