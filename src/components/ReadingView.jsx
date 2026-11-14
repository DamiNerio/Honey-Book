import { useEffect, useMemo, useState } from 'react';
import { translateGenre } from '../data/genres';
import { translate } from '../i18n/translations';
import {
  formatClock,
  formatDateShort,
  formatDuration,
  getCompletionPercentage,
} from '../utils/formatters';
import BookCover from './BookCover';
import {
  ArrowRightIcon,
  ClockIcon,
  EditIcon,
  PauseIcon,
  PlayIcon,
  ResetIcon,
} from './Icons';

export default function ReadingView({
  books,
  readingMap,
  selectedReadingId,
  onSelectReadingBook,
  timer,
  liveTimerSeconds,
  lang,
  onStartTimer,
  onPauseTimer,
  onResetTimer,
  onLogSession,
  onEditBookPages,
  onBrowseDirectory,
}) {
  const t = (key, vars) => translate(lang, key, vars);

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
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setPageInput('');
    setManualMinutes('');
    setShowManualTime(false);
    setErrorMsg('');
  }, [activeBook?.id]);

  if (!activeBook || !activeEntry) {
    return (
      <section className="page-section" aria-labelledby="reading-heading">
        <div className="page-header">
          <div>
            <span className="eyebrow-label">{t('readEyebrow')}</span>
            <h1 id="reading-heading" className="page-title">
              {t('readTitle')}
            </h1>
            <p className="page-subtitle">{t('readSubtitle')}</p>
          </div>
        </div>

        <div className="empty-state">
          <p className="empty-state__title">{t('readEmptyTitle')}</p>
          <p className="empty-state__desc">{t('readEmptyDesc')}</p>
          <button type="button" className="btn btn--primary" onClick={onBrowseDirectory}>
            <span>{t('readChooseBtn')}</span>
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

  const activeCountLabel =
    readingBooks.length === 1
      ? t('readActiveSingle')
      : t('readActivePlural', { count: readingBooks.length });

  const sessionWord =
    activeEntry.sessions.length === 1 ? t('sessionSingle') : t('sessionPlural');

  const handleSubmitSession = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const targetPage = parseInt(pageInput, 10);
    if (Number.isNaN(targetPage)) {
      setErrorMsg(t('logErrInvalidPage'));
      return;
    }
    if (targetPage < activeEntry.currentPage) {
      setErrorMsg(t('logErrBelowCurrent', { current: activeEntry.currentPage }));
      return;
    }
    if (targetPage > activeBook.totalPages) {
      setErrorMsg(t('logErrAboveTotal', { total: activeBook.totalPages }));
      return;
    }

    let durationSeconds = displayedTimerSeconds;
    if (durationSeconds === 0 && showManualTime && manualMinutes !== '') {
      const mins = parseFloat(manualMinutes);
      if (Number.isNaN(mins) || mins < 0) {
        setErrorMsg(t('logErrManualMins'));
        return;
      }
      durationSeconds = Math.round(mins * 60);
    }

    if (targetPage === activeEntry.currentPage && durationSeconds === 0) {
      setErrorMsg(t('logErrNoChange'));
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
    setErrorMsg('');
    setPageInput(String(Math.min(activeBook.totalPages, pageValue)));
  };

  return (
    <section className="page-section" aria-labelledby="reading-heading">
      <div className="page-header">
        <div>
          <span className="eyebrow-label">{t('readEyebrow')}</span>
          <h1 id="reading-heading" className="page-title">
            {t('readTitle')}
          </h1>
          <p className="page-subtitle">{t('readSubtitle')}</p>
        </div>

        <span className="header-stat-pill">
          <span>{activeCountLabel}</span>
        </span>
      </div>

      {readingBooks.length > 1 && (
        <div className="reading-switcher" role="tablist" aria-label={t('navReading')}>
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
        <div className="reading-book-panel">
          <div className="reading-book-panel__top">
            <BookCover book={activeBook} size="lg" lang={lang} />
            <div className="reading-book-panel__meta">
              <span className="meta-tag">{translateGenre(activeBook.genre, lang)}</span>
              <h2 className="reading-book-panel__title">{activeBook.title}</h2>
              <p className="reading-book-panel__author">
                {t('byAuthor', { author: activeBook.author })}
              </p>

              <div className="reading-stats-row">
                <div>
                  <span className="eyebrow-label">{t('readProgressLabel')}</span>
                  <div className="reading-pct-hero mono-num">{currentPct}%</div>
                </div>
                <div>
                  <span className="eyebrow-label">{t('readCurrentPageLabel')}</span>
                  <div className="reading-page-hero mono-num">
                    {activeEntry.currentPage}
                    <span className="reading-page-hero__total"> / {activeBook.totalPages}</span>
                    {onEditBookPages && (
                      <button
                        type="button"
                        className="inline-edit-btn"
                        onClick={() => onEditBookPages(activeBook)}
                        title={t('readEditTotalPages')}
                        aria-label={t('readEditTotalPages')}
                      >
                        <EditIcon size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="progress-track progress-track--lg">
                <div className="progress-track__fill" style={{ width: `${currentPct}%` }} />
              </div>

              <div className="reading-accumulated">
                <ClockIcon size={14} />
                <span>
                  {t('readAccumulated')}{' '}
                  <strong className="mono-num">{formatDuration(totalBookSeconds)}</strong>{' '}
                  {t('readAcrossSessions', {
                    count: activeEntry.sessions.length,
                    unit: sessionWord,
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="reading-controls-panel">
          <div className="timer-card">
            <div className="timer-card__head">
              <span className="eyebrow-label">{t('timerLabel')}</span>
              <span className={`timer-status ${isTimerRunningHere ? 'is-running' : ''}`}>
                <span className="timer-status__dot" aria-hidden="true" />
                {isTimerRunningHere
                  ? t('timerActive')
                  : displayedTimerSeconds > 0
                  ? t('timerPaused')
                  : t('timerReady')}
              </span>
            </div>

            {!timerBelongsToSelected && (liveTimerSeconds > 0 || timer.isRunning) ? (
              <div className="timer-other-notice">
                <p>
                  {t('timerRunningOther', {
                    time: formatClock(liveTimerSeconds),
                    title: timerBook?.title || '',
                  })}
                </p>
                <div className="timer-other-notice__actions">
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={() => onSelectReadingBook(timer.activeBookId)}
                  >
                    {t('timerSwitchBook', { title: timerBook?.title || '' })}
                  </button>
                  <button
                    type="button"
                    className="btn btn--violet-soft btn--sm"
                    onClick={() => onStartTimer(activeBook.id, true)}
                  >
                    {t('timerStartFresh')}
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
                      <span>{t('timerPause')}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      id="timer-start-btn"
                      className="btn btn--primary"
                      onClick={() => onStartTimer(activeBook.id, false)}
                    >
                      <PlayIcon size={15} />
                      <span>{displayedTimerSeconds > 0 ? t('timerResume') : t('timerStart')}</span>
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
                    <span>{t('timerReset')}</span>
                  </button>
                </div>
              </>
            )}
          </div>

          <form className="log-form" onSubmit={handleSubmitSession} noValidate>
            <div className="log-form__header">
              <label htmlFor="page-reached-input" className="eyebrow-label">
                {t('logLabel')}
              </label>
              <span className="log-form__hint mono-num">
                {t('logRangeHint', {
                  current: activeEntry.currentPage,
                  total: activeBook.totalPages,
                })}
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
                  setErrorMsg('');
                  setPageInput(e.target.value);
                }}
                placeholder={t('logInputPlaceholder', {
                  current: activeEntry.currentPage,
                  total: activeBook.totalPages,
                })}
                className="page-number-input mono-num"
              />
            </div>

            <div className="quick-chips">
              <button
                type="button"
                className="quick-chip"
                onClick={() => applyQuickPage(activeEntry.currentPage + 10)}
                disabled={activeEntry.currentPage >= activeBook.totalPages}
              >
                {t('logQuickPlus10')}
              </button>
              <button
                type="button"
                className="quick-chip"
                onClick={() => applyQuickPage(activeEntry.currentPage + 25)}
                disabled={activeEntry.currentPage >= activeBook.totalPages}
              >
                {t('logQuickPlus25')}
              </button>
              <button
                type="button"
                id="quick-finish-page-btn"
                className="quick-chip quick-chip--violet"
                onClick={() => applyQuickPage(activeBook.totalPages)}
              >
                {t('logQuickFinish', { total: activeBook.totalPages })}
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
                    {t('logAddManualLink')}
                  </button>
                ) : (
                  <div className="manual-time-row">
                    <label htmlFor="manual-minutes-input">{t('logManualLabel')}</label>
                    <input
                      id="manual-minutes-input"
                      type="number"
                      min="0"
                      max="1440"
                      value={manualMinutes}
                      onChange={(e) => setManualMinutes(e.target.value)}
                      placeholder="25"
                      className="mono-num"
                    />
                  </div>
                )}
              </div>
            )}

            {hasValidPreview && (
              <div className={`log-preview ${willComplete ? 'is-completing' : ''}`}>
                {willComplete ? (
                  <span>{t('logPreviewComplete', { delta: pagesDelta })}</span>
                ) : (
                  <span>
                    {t('logPreviewProgress', {
                      delta: pagesDelta,
                      pageUnit: pagesDelta === 1 ? t('pageSingle') : t('pagePlural'),
                      pct: previewPct,
                    })}
                    {displayedTimerSeconds > 0
                      ? t('logPreviewWithTime', { time: formatDuration(displayedTimerSeconds) })
                      : ''}
                  </span>
                )}
              </div>
            )}

            {errorMsg && (
              <p className="form-error" role="alert">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              id="log-session-submit"
              className="btn btn--primary btn--full"
            >
              {willComplete ? t('logSubmitFinish') : t('logSubmitNormal')}
            </button>
          </form>
        </div>
      </div>

      <div className="sessions-section">
        <div className="sessions-section__head">
          <h3 className="sessions-section__title">{t('sessionsTitle')}</h3>
          <span className="sessions-section__summary mono-num">
            {t('sessionsSummary', {
              count: activeEntry.sessions.length,
              time: formatDuration(totalBookSeconds),
            })}
          </span>
        </div>

        {activeEntry.sessions.length === 0 ? (
          <p className="sessions-empty">{t('sessionsEmpty')}</p>
        ) : (
          <div className="sessions-list">
            {[...activeEntry.sessions].reverse().map((session, idx, arr) => (
              <div key={session.id} className="session-row">
                <div className="session-row__left">
                  <span className="session-row__index mono-num">#{arr.length - idx}</span>
                  <span className="session-row__date">
                    {formatDateShort(session.timestamp, lang)}
                  </span>
                </div>

                <div className="session-row__pages mono-num">
                  {t('sessionPageArrow', {
                    start: session.startPage,
                    end: session.endPage,
                  })}
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
