import { useState } from 'react';
import BookCover from './BookCover';
import {
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon,
  EditIcon,
} from './Icons';
import { formatDateShort, formatDuration } from '../utils/formatters';

function CompletedBookCard({
  book,
  record,
  onSaveReview,
  onSelectBook,
}) {
  const [isEditing, setIsEditing] = useState(!record.review);
  const [draftReview, setDraftReview] = useState(record.review || '');
  const [draftRating, setDraftRating] = useState(record.rating || 0);
  const [showSessions, setShowSessions] = useState(false);

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
          aria-label={`View ${book.title}`}
        >
          <BookCover book={book} size="md" />
        </button>

        <div className="completed-card__body">
          <div className="completed-card__header">
            <div>
              <div className="completed-card__meta">
                <span className="completed-badge">
                  <CheckCircleIcon size={13} />
                  <span>Completed {formatDateShort(record.completedAt)}</span>
                </span>
                <span className="meta-dot" aria-hidden="true">·</span>
                <span className="mono-num">{book.totalPages} pages</span>
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
              <p className="completed-card__author">by {book.author}</p>
            </div>

            <div className="completed-time-stat">
              <span className="eyebrow-label">Total Reading Time</span>
              <div className="completed-time-stat__value mono-num">
                <ClockIcon size={16} />
                <span>{formatDuration(record.totalReadingSeconds)}</span>
              </div>
              <span className="completed-time-stat__sub mono-num">
                across {record.sessionsCount}{' '}
                {record.sessionsCount === 1 ? 'session' : 'sessions'}
              </span>
            </div>
          </div>

          {/* Personal Review & Thoughts */}
          <div className="review-block">
            <div className="review-block__head">
              <span className="eyebrow-label">Personal Review &amp; Thoughts</span>
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
                  <span>{record.review ? 'Edit thoughts' : 'Write review'}</span>
                </button>
              )}
            </div>

            {isEditing ? (
              <form className="review-form" onSubmit={handleSave}>
                <div className="rating-row" aria-label="Personal rating">
                  <span className="rating-row__label">Impression</span>
                  <div className="rating-diamonds">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        className={`rating-star ${draftRating >= value ? 'is-filled' : ''}`}
                        onClick={() => setDraftRating(draftRating === value ? 0 : value)}
                        aria-label={`Rate ${value} out of 5`}
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
                  placeholder="Capture your reflections, favorite passages, or how this book stayed with you..."
                  className="review-textarea"
                />

                <div className="review-form__actions">
                  {record.review && (
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      onClick={handleCancel}
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    id={`save-review-${book.id}`}
                    className="btn btn--primary btn--sm"
                  >
                    Save Thoughts
                  </button>
                </div>
              </form>
            ) : (
              <div className="review-display">
                {record.rating > 0 && (
                  <div className="rating-display" aria-label={`Rated ${record.rating} out of 5`}>
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
                  <p className="review-empty">No reflections recorded yet.</p>
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
                  ? 'Hide session breakdown'
                  : `View ${record.sessions.length} reading ${
                      record.sessions.length === 1 ? 'session' : 'sessions'
                    }`}
              </button>

              {showSessions && (
                <div className="sessions-list sessions-list--compact">
                  {record.sessions.map((s, idx) => (
                    <div key={s.id} className="session-row">
                      <div className="session-row__left">
                        <span className="session-row__index mono-num">#{idx + 1}</span>
                        <span className="session-row__date">{formatDateShort(s.timestamp)}</span>
                      </div>
                      <div className="session-row__pages mono-num">
                        Page {s.startPage} → {s.endPage}
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
  onSaveReview,
  onSelectBook,
  onBrowseDirectory,
}) {
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
          <span className="eyebrow-label">Finished Shelf</span>
          <h1 id="completed-heading" className="page-title">
            Completed Books
          </h1>
          <p className="page-subtitle">
            Books move here automatically upon finishing—preserving total reading time and your personal thoughts.
          </p>
        </div>

        <span className="header-stat-pill">
          <ClockIcon size={14} />
          <span className="mono-num">{formatDuration(totalHoursSeconds)}</span>
          <span>logged across {completedItems.length} finished</span>
        </span>
      </div>

      {completedItems.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state__title">No finished books yet</p>
          <p className="empty-state__desc">
            Once a book reaches 100% in your Reading workspace, it will automatically arrive here.
          </p>
          <button type="button" className="btn btn--primary" onClick={onBrowseDirectory}>
            <span>Start a Book</span>
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
              onSaveReview={onSaveReview}
              onSelectBook={onSelectBook}
            />
          ))}
        </div>
      )}
    </section>
  );
}
