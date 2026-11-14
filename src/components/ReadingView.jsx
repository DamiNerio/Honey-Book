import { useEffect, useMemo, useState } from 'react';
import BookCover from './BookCover';
import {
  ArrowRightIcon,
  ClockIcon,
  EditIcon,
  PauseIcon,
  PlayIcon,
  ResetIcon,
} from './Icons';
import {
  formatClock,
  formatDateShort,
  formatDuration,
  getCompletionPercentage,
} from '../utils/formatters';

export default function ReadingView({
  books,
  readingMap,
  selectedReadingId,
  onSelectReadingBook,
  timer,
  liveTimerSeconds,
  onStartTimer,
  onPauseTimer,
  onResetTimer,
  onLogSession,
  onEditBookPages,
  onBrowseDirectory,
}) {
  const readingBooks = useMemo(
    () => books.filter((b) => Boolean(readingMap[b.id])),
    [books, readingMap]
  );

  const activeBook =
    readingBooks.find((b) => b.id === selectedReadingId) || readingBooks[0] || null;
  const activeEntry = activeBook ? readingMap[activeBook.id] : null;

  const [pageInput, setPageInput] = useState('');
  const [manualMinutes, setManualMinutes] = useState('');
  const [showManualTime, setShowManualTime] = useState(false);
  const [error, setError] = useState('');

  // Clear stale input & error when switching active book
  useEffect(() => {
    setPageInput('');
    setManualMinutes('');
    setShowManualTime(false);
    setError('');
  }, [activeBook?.id]);

  if (!activeBook || !activeEntry) {
    return (
      <section className="page-section" aria-labelledby="reading-heading">
        <div className="page-header">
          <div>
            <span className="eyebrow-label">Session Room</span>
            <h1 id="reading-heading" className="page-title">
              Currently Reading
            </h1>
            <p className="page-subtitle">
              Track your page progress and time each reading session in calm focus.
            </p>
          </div>
        </div>

        <div className="empty-state">
          <p className="empty-state__title">No book currently in progress</p>
          <p className="empty-state__desc">
            Select a book from the Directory or your Wishlist to open your reading timer and log pages.
          </p>
          <button type="button" className="btn btn--primary" onClick={onBrowseDirectory}>
            <span>Choose a Book</span>
            <ArrowRightIcon size={15} />
          </button>
        </div>
      </section>
    );
  }

  const currentPct = getCompletionPercentage(activeEntry.currentPage, activeBook.totalPages);
  const totalBookSeconds = activeEntry.sessions.reduce(
    (sum, s) => sum + (s.durationSeconds || 0),
    0
  );

  const timerBelongsToSelected =
    timer.activeBookId === activeBook.id || timer.activeBookId === null;
  const timerBook = timer.activeBookId
    ? books.find((b) => b.id === timer.activeBookId)
    : null;
  const displayedTimerSeconds = timerBelongsToSelected ? liveTimerSeconds : 0;
  const isTimerRunningHere = timerBelongsToSelected && timer.isRunning;

  const parsedPage = pageInput === '' ? NaN : parseInt(pageInput, 10);
  const hasValidPreview =
    !Number.isNaN(parsedPage) &&
    parsedPage >= activeEntry.currentPage &&
    parsedPage <= activeBook.totalPages;
  const previewPct = hasValidPreview
    ? getCompletionPercentage(parsedPage, activeBook.totalPages)
    : currentPct;
  const pagesDelta = hasValidPreview ? parsedPage - activeEntry.currentPage : 0;
  const willComplete = hasValidPreview && parsedPage >= activeBook.totalPages;

  const handleSubmitSession = (e) => {
    e.preventDefault();
    setError('');

    const targetPage = parseInt(pageInput, 10);
    if (Number.isNaN(targetPage)) {
      setError('Enter the page number you reached in this session.');
      return;
    }
    if (targetPage < activeEntry.currentPage) {
      setError(
        `Page reached cannot be less than your current page (${activeEntry.currentPage}).`
      );
      return;
    }
    if (targetPage > activeBook.totalPages) {
      setError(`This book has ${activeBook.totalPages} pages total.`);
      return;
    }

    let durationSeconds = displayedTimerSeconds;
    if (durationSeconds === 0 && showManualTime && manualMinutes !== '') {
      const mins = parseFloat(manualMinutes);
      if (Number.isNaN(mins) || mins < 0) {
        setError('Please enter a valid number of minutes.');
        return;
      }
      durationSeconds = Math.round(mins * 60);
    }

    if (targetPage === activeEntry.currentPage && durationSeconds === 0) {
      setError('Advance your page number or record session time before logging.');
      return;
    }

    onLogSession({
      bookId: activeBook.id,
      endPage: targetPage,
      durationSeconds,
      clearTimer: timerBelongsToSelected,
    });

    setPageInput('');
    setManualMinutes('');
    setShowManualTime(false);
  };

  const applyQuickPage = (pageValue) => {
    setError('');
    setPageInput(String(Math.min(activeBook.totalPages, pageValue)));
  };

  return (
    <section className="page-section" aria-labelledby="reading-heading">
      <div className="page-header">
        <div>
          <span className="eyebrow-label">Session Room</span>
          <h1 id="reading-heading" className="page-title">
            Reading Progress &amp; Timer
          </h1>
          <p className="page-subtitle">
            Time each reading session and enter the page reached to update your completion.
          </p>
        </div>

        <span className="header-stat-pill">
          <span className="mono-num">{readingBooks.length}</span>
          <span>{readingBooks.length === 1 ? 'active book' : 'active books'}</span>
        </span>
      </div>

      {readingBooks.length > 1 && (
        <div className="reading-switcher" role="tablist" aria-label="Active books">
          {readingBooks.map((book) => {
            const entry = readingMap[book.id];
            const pct = getCompletionPercentage(entry.currentPage, book.totalPages);
            const selected = book.id === activeBook.id;
            return (
              <button
                key={book.id}
                type="button"
                role="tab"
                aria-selected={selected}
                className={`reading-switcher__pill ${selected ? 'is-active' : ''}`}
                onClick={() => onSelectReadingBook(book.id)}
              >
                <span className="reading-switcher__title">{book.title}</span>
                <span className="reading-switcher__pct mono-num">{pct}%</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="reading-workbench">
        {/* Left: Active Book Overview & Completion */}
        <div className="reading-book-panel">
          <div className="reading-book-panel__top">
            <BookCover book={activeBook} size="lg" />
            <div className="reading-book-panel__meta">
              <span className="meta-tag">{activeBook.genre}</span>
              <h2 className="reading-book-panel__title">{activeBook.title}</h2>
              <p className="reading-book-panel__author">by {activeBook.author}</p>

              <div className="reading-stats-row">
                <div>
                  <span className="eyebrow-label">Progress</span>
                  <div className="reading-pct-hero mono-num">{currentPct}%</div>
                </div>
                <div>
                  <span className="eyebrow-label">Current Page</span>
                  <div className="reading-page-hero mono-num">
                    {activeEntry.currentPage}
                    <span className="reading-page-hero__total"> / {activeBook.totalPages}</span>
                    {onEditBookPages && (
                      <button
                        type="button"
                        className="inline-edit-btn"
                        onClick={() => onEditBookPages(activeBook)}
                        title="Edit total page count"
                        aria-label="Edit total page count"
                      >
                        <EditIcon size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="progress-track progress-track--lg" aria-label={`${currentPct}% completed`}>
                <div className="progress-track__fill" style={{ width: `${currentPct}%` }} />
              </div>

              <div className="reading-accumulated">
                <ClockIcon size={14} />
                <span>
                  Accumulated time:{' '}
                  <strong className="mono-num">{formatDuration(totalBookSeconds)}</strong> across{' '}
                  <span className="mono-num">{activeEntry.sessions.length}</span>{' '}
                  {activeEntry.sessions.length === 1 ? 'session' : 'sessions'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Built-in Timer + Page Progress Logger */}
        <div className="reading-controls-panel">
          <div className="timer-card">
            <div className="timer-card__head">
              <span className="eyebrow-label">Session Timer</span>
              <span className={`timer-status ${isTimerRunningHere ? 'is-running' : ''}`}>
                <span className="timer-status__dot" aria-hidden="true" />
                {isTimerRunningHere
                  ? 'Active'
                  : displayedTimerSeconds > 0
                  ? 'Paused'
                  : 'Ready'}
              </span>
            </div>

            {!timerBelongsToSelected && (liveTimerSeconds > 0 || timer.isRunning) ? (
              <div className="timer-other-notice">
                <p>
                  Timer currently holds{' '}
                  <strong className="mono-num">{formatClock(liveTimerSeconds)}</strong> for{' '}
                  <strong>{timerBook?.title || 'another book'}</strong>.
                </p>
                <div className="timer-other-notice__actions">
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={() => onSelectReadingBook(timer.activeBookId)}
                  >
                    Switch to {timerBook?.title}
                  </button>
                  <button
                    type="button"
                    className="btn btn--violet-soft btn--sm"
                    onClick={() => onStartTimer(activeBook.id, true)}
                  >
                    Start New Here
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div id="session-timer-display" className="timer-readout mono-num" aria-live="off">
                  {formatClock(displayedTimerSeconds)}
                </div>

                <div className="timer-actions">
                  {isTimerRunningHere ? (
                    <button
                      type="button"
                      id="timer-pause-btn"
                      className="btn btn--violet-outline"
                      onClick={onPauseTimer}
                    >
                      <PauseIcon size={15} />
                      <span>Pause</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      id="timer-start-btn"
                      className="btn btn--primary"
                      onClick={() => onStartTimer(activeBook.id, false)}
                    >
                      <PlayIcon size={15} />
                      <span>{displayedTimerSeconds > 0 ? 'Resume' : 'Start Timer'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    id="timer-reset-btn"
                    className="btn btn--ghost"
                    onClick={onResetTimer}
                    disabled={displayedTimerSeconds === 0 && !isTimerRunningHere}
                  >
                    <ResetIcon size={15} />
                    <span>Reset</span>
                  </button>
                </div>
              </>
            )}
          </div>

          <form className="log-form" onSubmit={handleSubmitSession} noValidate>
            <div className="log-form__header">
              <label htmlFor="page-reached-input" className="eyebrow-label">
                Log Reading Progress
              </label>
              <span className="log-form__hint mono-num">
                Page {activeEntry.currentPage} → {activeBook.totalPages}
              </span>
            </div>

            <div className="page-input-row">
              <input
                id="page-reached-input"
                type="number"
                min={activeEntry.currentPage}
                max={activeBook.totalPages}
                value={pageInput}
                onChange={(e) => {
                  setError('');
                  setPageInput(e.target.value);
                }}
                placeholder={`Enter page reached (${activeEntry.currentPage}–${activeBook.totalPages})`}
                className="page-number-input mono-num"
              />
            </div>

            <div className="quick-chips" aria-label="Quick page shortcuts">
              <button
                type="button"
                className="quick-chip"
                onClick={() => applyQuickPage(activeEntry.currentPage + 10)}
                disabled={activeEntry.currentPage >= activeBook.totalPages}
              >
                +10 pages
              </button>
              <button
                type="button"
                className="quick-chip"
                onClick={() => applyQuickPage(activeEntry.currentPage + 25)}
                disabled={activeEntry.currentPage >= activeBook.totalPages}
              >
                +25 pages
              </button>
              <button
                type="button"
                id="quick-finish-page-btn"
                className="quick-chip quick-chip--violet"
                onClick={() => applyQuickPage(activeBook.totalPages)}
              >
                Final page ({activeBook.totalPages})
              </button>
            </div>

            {displayedTimerSeconds === 0 && (
              <div className="manual-time-wrap">
                {!showManualTime ? (
                  <button
                    type="button"
                    className="text-link-btn"
                    onClick={() => setShowManualTime(true)}
                  >
                    + Add offline reading minutes manually
                  </button>
                ) : (
                  <div className="manual-time-row">
                    <label htmlFor="manual-minutes-input">Offline duration (min)</label>
                    <input
                      id="manual-minutes-input"
                      type="number"
                      min="0"
                      max="1440"
                      value={manualMinutes}
                      onChange={(e) => setManualMinutes(e.target.value)}
                      placeholder="e.g. 25"
                      className="mono-num"
                    />
                  </div>
                )}
              </div>
            )}

            {hasValidPreview && (
              <div className={`log-preview ${willComplete ? 'is-completing' : ''}`}>
                {willComplete ? (
                  <span>
                    Reaches <strong>100%</strong> (+{pagesDelta} pages) — book will automatically move to{' '}
                    <strong>Completed</strong>.
                  </span>
                ) : (
                  <span>
                    +{pagesDelta} {pagesDelta === 1 ? 'page' : 'pages'} · updates completion to{' '}
                    <strong className="mono-num">{previewPct}%</strong>
                    {displayedTimerSeconds > 0
                      ? ` · logs ${formatDuration(displayedTimerSeconds)}`
                      : ''}
                  </span>
                )}
              </div>
            )}

            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              id="log-session-submit"
              className="btn btn--primary btn--full"
            >
              {willComplete ? 'Finish Book & Move to Completed' : 'Log Session & Update Progress'}
            </button>
          </form>
        </div>
      </div>

      {/* Session History */}
      <div className="sessions-section">
        <div className="sessions-section__head">
          <h3 className="sessions-section__title">Reading Sessions</h3>
          <span className="sessions-section__summary mono-num">
            {activeEntry.sessions.length} logged · {formatDuration(totalBookSeconds)} total
          </span>
        </div>

        {activeEntry.sessions.length === 0 ? (
          <p className="sessions-empty">
            No sessions logged for this book yet. Start the timer or enter your first page milestone above.
          </p>
        ) : (
          <div className="sessions-list">
            {[...activeEntry.sessions].reverse().map((session, idx, arr) => (
              <div key={session.id} className="session-row">
                <div className="session-row__left">
                  <span className="session-row__index mono-num">
                    #{arr.length - idx}
                  </span>
                  <span className="session-row__date">
                    {formatDateShort(session.timestamp)}
                  </span>
                </div>

                <div className="session-row__pages mono-num">
                  Page {session.startPage} → {session.endPage}
                  <span className="session-row__delta"> (+{session.pagesRead}p)</span>
                </div>

                <div className="session-row__duration mono-num">
                  <ClockIcon size={13} />
                  <span>{formatDuration(session.durationSeconds)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
