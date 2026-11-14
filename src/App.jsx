import { useEffect, useMemo, useState } from 'react';
import './App.css';
import AddBookModal from './components/AddBookModal';
import AuthScreen from './components/AuthScreen';
import BookDetailModal from './components/BookDetailModal';
import CompletedView from './components/CompletedView';
import DirectoryView from './components/DirectoryView';
import Header from './components/Header';
import ReadingView from './components/ReadingView';
import SetPagesModal from './components/SetPagesModal';
import WishlistView from './components/WishlistView';
import { translate } from './i18n/translations';
import {
  getCurrentUser,
  getStoredLanguage,
  logoutUser,
  saveStoredLanguage,
} from './utils/auth';
import { computeLiveTimerSeconds, getCompletionPercentage } from './utils/formatters';
import {
  clearLegacySeedStorage,
  clearUserLibrary,
  createEmptyLibrary,
  loadUserLibrary,
  saveUserLibrary,
} from './utils/storage';

export default function App() {
  const [lang, setLang] = useState(() => getStoredLanguage());
  const [user, setUser] = useState(() => {
    clearLegacySeedStorage();
    return getCurrentUser();
  });

  const [library, setLibrary] = useState(() => {
    const activeUser = getCurrentUser();
    return activeUser ? loadUserLibrary(activeUser.id) : createEmptyLibrary();
  });

  const [activeTab, setActiveTab] = useState('directory');
  const [selectedReadingId, setSelectedReadingId] = useState(() => {
    const activeUser = getCurrentUser();
    const loaded = activeUser ? loadUserLibrary(activeUser.id) : createEmptyLibrary();
    return Object.keys(loaded.reading)[0] || null;
  });

  const [detailBook, setDetailBook] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [pendingPagesModal, setPendingPagesModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());

  const t = (key, vars) => translate(lang, key, vars);

  // Sync HTML lang attribute & document title
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = translate(lang, 'appTitle');
    saveStoredLanguage(lang);
  }, [lang]);

  // Persist current user's isolated library
  useEffect(() => {
    if (!user?.id) return;
    saveUserLibrary(user.id, library);
  }, [user?.id, library]);

  // Live timer ticker
  useEffect(() => {
    if (!library.timer.isRunning) return undefined;
    setNowMs(Date.now());
    const interval = window.setInterval(() => {
      setNowMs(Date.now());
    }, 500);
    return () => window.clearInterval(interval);
  }, [library.timer.isRunning]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(null), 4800);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  // Auto-clear footer confirmation
  useEffect(() => {
    if (!confirmClear) return undefined;
    const timeout = window.setTimeout(() => setConfirmClear(false), 4000);
    return () => window.clearTimeout(timeout);
  }, [confirmClear]);

  const liveTimerSeconds = useMemo(
    () => computeLiveTimerSeconds(library.timer, nowMs),
    [library.timer, nowMs]
  );

  const timerBook = useMemo(() => {
    if (!library.timer.activeBookId) return null;
    return library.books.find((b) => b.id === library.timer.activeBookId) || null;
  }, [library.books, library.timer.activeBookId]);

  const counts = useMemo(
    () => ({
      directory: library.books.length,
      wishlist: library.wishlistIds.length,
      reading: Object.keys(library.reading).length,
      completed: Object.keys(library.completed).length,
    }),
    [library]
  );

  const showToast = (key, vars = {}, actionKey = null, onAction = null) => {
    setToast({ id: Date.now(), key, vars, actionKey, onAction });
  };

  const handleAuthenticated = (authenticatedUser) => {
    const userLib = loadUserLibrary(authenticatedUser.id);
    setUser(authenticatedUser);
    setLibrary(userLib);
    setSelectedReadingId(Object.keys(userLib.reading)[0] || null);
    setActiveTab('directory');
    setDetailBook(null);
    setIsAddModalOpen(false);
    setPendingPagesModal(null);
    setToast(null);
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setLibrary(createEmptyLibrary());
    setSelectedReadingId(null);
    setActiveTab('directory');
    setDetailBook(null);
    setIsAddModalOpen(false);
    setPendingPagesModal(null);
    setToast(null);
  };

  const ensureBookInList = (booksList, bookObj) => {
    const exists = booksList.some((b) => b.id === bookObj.id);
    if (exists) {
      return booksList.map((b) => (b.id === bookObj.id ? { ...b, ...bookObj } : b));
    }
    return [bookObj, ...booksList];
  };

  const handleToggleWishlist = (bookOrId) => {
    const targetBook =
      typeof bookOrId === 'string'
        ? library.books.find((b) => b.id === bookOrId)
        : bookOrId;

    if (!targetBook) return;

    const alreadyWishlisted = library.wishlistIds.includes(targetBook.id);

    setLibrary((prev) => {
      const nextBooks = ensureBookInList(prev.books, targetBook);
      const nextWishlist = alreadyWishlisted
        ? prev.wishlistIds.filter((id) => id !== targetBook.id)
        : [targetBook.id, ...prev.wishlistIds];

      return {
        ...prev,
        books: nextBooks,
        wishlistIds: nextWishlist,
      };
    });

    showToast(
      alreadyWishlisted ? 'toastRemovedWishlist' : 'toastAddedWishlist',
      { title: targetBook.title }
    );
  };

  const beginReadingBook = (bookWithPages) => {
    setLibrary((prev) => {
      const nextBooks = ensureBookInList(prev.books, bookWithPages);
      const existing = prev.reading[bookWithPages.id];
      const nextReading = existing
        ? prev.reading
        : {
            ...prev.reading,
            [bookWithPages.id]: {
              currentPage: 0,
              startedAt: new Date().toISOString(),
              sessions: [],
            },
          };

      return {
        ...prev,
        books: nextBooks,
        wishlistIds: prev.wishlistIds.filter((id) => id !== bookWithPages.id),
        reading: nextReading,
      };
    });

    setSelectedReadingId(bookWithPages.id);
    setActiveTab('reading');
    showToast('toastStartedReading', { title: bookWithPages.title });
  };

  const handleStartReading = (bookOrId) => {
    const targetBook =
      typeof bookOrId === 'string'
        ? library.books.find((b) => b.id === bookOrId)
        : bookOrId;

    if (!targetBook) return;

    if (library.completed[targetBook.id]) {
      setActiveTab('completed');
      return;
    }

    if (!targetBook.totalPages || targetBook.totalPages <= 0) {
      setPendingPagesModal({ book: targetBook, mode: 'start' });
      return;
    }

    beginReadingBook(targetBook);
  };

  const handleConfirmPages = (book, pageCount) => {
    const updatedBook = { ...book, totalPages: pageCount };
    const mode = pendingPagesModal?.mode || 'start';
    setPendingPagesModal(null);

    if (mode === 'start') {
      beginReadingBook(updatedBook);
      return;
    }

    let completedNow = false;
    setLibrary((prev) => {
      const nextBooks = ensureBookInList(prev.books, updatedBook);
      const entry = prev.reading[book.id];
      if (!entry) return { ...prev, books: nextBooks };

      if (entry.currentPage >= pageCount) {
        completedNow = true;
        const nextReading = { ...prev.reading };
        delete nextReading[book.id];
        const totalReadingSeconds = entry.sessions.reduce(
          (sum, s) => sum + (s.durationSeconds || 0),
          0
        );
        const nextCompleted = {
          ...prev.completed,
          [book.id]: {
            completedAt: new Date().toISOString(),
            totalReadingSeconds,
            sessionsCount: entry.sessions.length,
            sessions: entry.sessions,
            rating: 0,
            review: '',
          },
        };
        const shouldResetTimer = prev.timer.activeBookId === book.id;
        return {
          ...prev,
          books: nextBooks,
          reading: nextReading,
          completed: nextCompleted,
          timer: shouldResetTimer
            ? { activeBookId: null, isRunning: false, elapsedSeconds: 0, lastStartedAtMs: null }
            : prev.timer,
        };
      }

      return { ...prev, books: nextBooks };
    });

    if (completedNow) {
      showToast(
        'toastFinishedBook',
        { title: book.title },
        'actViewCompleted',
        () => setActiveTab('completed')
      );
    } else {
      showToast('toastUpdatedPages', { title: book.title, count: pageCount });
    }
  };

  const handleOpenSection = (tab, bookId = null) => {
    if (tab === 'reading' && bookId) {
      setSelectedReadingId(bookId);
    }
    setActiveTab(tab);
  };

  const handleAddCustomBook = (newBook, addToWishlist) => {
    setLibrary((prev) => ({
      ...prev,
      books: [newBook, ...prev.books],
      wishlistIds: addToWishlist ? [newBook.id, ...prev.wishlistIds] : prev.wishlistIds,
    }));
    showToast(
      addToWishlist ? 'toastAddedCustomWishlist' : 'toastAddedCustom',
      { title: newBook.title }
    );
  };

  const handleStartTimer = (bookId, forceReset = false) => {
    const currentNow = Date.now();
    setNowMs(currentNow);
    setLibrary((prev) => {
      const sameBook = prev.timer.activeBookId === bookId;
      const baseElapsed =
        forceReset || !sameBook ? 0 : computeLiveTimerSeconds(prev.timer, currentNow);
      return {
        ...prev,
        timer: {
          activeBookId: bookId,
          isRunning: true,
          elapsedSeconds: baseElapsed,
          lastStartedAtMs: currentNow,
        },
      };
    });
  };

  const handlePauseTimer = () => {
    const currentNow = Date.now();
    setNowMs(currentNow);
    setLibrary((prev) => {
      const captured = computeLiveTimerSeconds(prev.timer, currentNow);
      return {
        ...prev,
        timer: {
          ...prev.timer,
          isRunning: false,
          elapsedSeconds: captured,
          lastStartedAtMs: null,
        },
      };
    });
  };

  const handleResetTimer = () => {
    setLibrary((prev) => ({
      ...prev,
      timer: {
        activeBookId: prev.timer.activeBookId,
        isRunning: false,
        elapsedSeconds: 0,
        lastStartedAtMs: null,
      },
    }));
  };

  const handleLogSession = ({ bookId, endPage, durationSeconds, clearTimer }) => {
    const book = library.books.find((b) => b.id === bookId);
    const entry = library.reading[bookId];
    if (!book || !entry) return;

    const clampedEnd = Math.min(book.totalPages, Math.max(entry.currentPage, endPage));
    const pagesRead = Math.max(0, clampedEnd - entry.currentPage);
    const newSession = {
      id: `session-${Date.now()}`,
      timestamp: new Date().toISOString(),
      startPage: entry.currentPage,
      endPage: clampedEnd,
      pagesRead,
      durationSeconds: Math.max(0, Math.round(durationSeconds || 0)),
    };

    const updatedSessions = [...entry.sessions, newSession];
    const isCompleted = clampedEnd >= book.totalPages;

    setLibrary((prev) => {
      const nextTimer = clearTimer
        ? {
            activeBookId: isCompleted ? null : bookId,
            isRunning: false,
            elapsedSeconds: 0,
            lastStartedAtMs: null,
          }
        : prev.timer;

      if (isCompleted) {
        const nextReading = { ...prev.reading };
        delete nextReading[bookId];

        const totalReadingSeconds = updatedSessions.reduce(
          (sum, s) => sum + (s.durationSeconds || 0),
          0
        );

        return {
          ...prev,
          wishlistIds: prev.wishlistIds.filter((id) => id !== bookId),
          reading: nextReading,
          completed: {
            ...prev.completed,
            [bookId]: {
              completedAt: new Date().toISOString(),
              totalReadingSeconds,
              sessionsCount: updatedSessions.length,
              sessions: updatedSessions,
              rating: prev.completed[bookId]?.rating || 0,
              review: prev.completed[bookId]?.review || '',
            },
          },
          timer: nextTimer,
        };
      }

      return {
        ...prev,
        reading: {
          ...prev.reading,
          [bookId]: {
            ...entry,
            currentPage: clampedEnd,
            sessions: updatedSessions,
          },
        },
        timer: nextTimer,
      };
    });

    if (isCompleted) {
      const remainingReadingIds = Object.keys(library.reading).filter((id) => id !== bookId);
      setSelectedReadingId(remainingReadingIds[0] || null);
      showToast(
        'toastFinishedBook',
        { title: book.title },
        'actViewCompleted',
        () => setActiveTab('completed')
      );
    } else {
      const pct = getCompletionPercentage(clampedEnd, book.totalPages);
      showToast('toastSessionLogged', { title: book.title, pct });
    }
  };

  const handleSaveReview = (bookId, review, rating) => {
    setLibrary((prev) => {
      const existing = prev.completed[bookId];
      if (!existing) return prev;
      return {
        ...prev,
        completed: {
          ...prev.completed,
          [bookId]: {
            ...existing,
            review,
            rating,
          },
        },
      };
    });
    showToast('toastReviewSaved');
  };

  const handleClearLibrary = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    const fresh = clearUserLibrary(user?.id);
    setLibrary(fresh);
    setSelectedReadingId(null);
    setConfirmClear(false);
    setActiveTab('directory');
    showToast('toastLibraryCleared');
  };

  if (!user) {
    return (
      <AuthScreen
        lang={lang}
        onChangeLang={setLang}
        onAuthenticated={handleAuthenticated}
      />
    );
  }

  const resolvedDetailBook = detailBook
    ? library.books.find((b) => b.id === detailBook.id) || detailBook
    : null;

  return (
    <div className="app-shell">
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        counts={counts}
        liveTimerSeconds={liveTimerSeconds}
        timerIsRunning={library.timer.isRunning}
        timerBookTitle={timerBook?.title}
        lang={lang}
        onChangeLang={setLang}
        user={user}
        onLogout={handleLogout}
      />

      <main className="app-main">
        {activeTab === 'directory' && (
          <DirectoryView
            books={library.books}
            wishlistIds={library.wishlistIds}
            readingMap={library.reading}
            completedMap={library.completed}
            lang={lang}
            onSelectBook={setDetailBook}
            onToggleWishlist={handleToggleWishlist}
            onStartReading={handleStartReading}
            onOpenSection={handleOpenSection}
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />
        )}

        {activeTab === 'wishlist' && (
          <WishlistView
            books={library.books}
            wishlistIds={library.wishlistIds}
            lang={lang}
            onToggleWishlist={handleToggleWishlist}
            onStartReading={handleStartReading}
            onSelectBook={setDetailBook}
            onBrowseDirectory={() => setActiveTab('directory')}
          />
        )}

        {activeTab === 'reading' && (
          <ReadingView
            books={library.books}
            readingMap={library.reading}
            selectedReadingId={selectedReadingId}
            onSelectReadingBook={setSelectedReadingId}
            timer={library.timer}
            liveTimerSeconds={liveTimerSeconds}
            lang={lang}
            onStartTimer={handleStartTimer}
            onPauseTimer={handlePauseTimer}
            onResetTimer={handleResetTimer}
            onLogSession={handleLogSession}
            onEditBookPages={(book) => setPendingPagesModal({ book, mode: 'edit' })}
            onBrowseDirectory={() => setActiveTab('directory')}
          />
        )}

        {activeTab === 'completed' && (
          <CompletedView
            books={library.books}
            completedMap={library.completed}
            lang={lang}
            onSaveReview={handleSaveReview}
            onSelectBook={setDetailBook}
            onBrowseDirectory={() => setActiveTab('directory')}
          />
        )}
      </main>

      <footer className="app-footer">
        <span>Book Violet · {t('footerPrivacy')}</span>
        <button
          type="button"
          id="clear-library-btn"
          className={`footer-reset-btn ${confirmClear ? 'is-confirming' : ''}`}
          onClick={handleClearLibrary}
        >
          {confirmClear ? t('footerClearConfirm') : t('footerClearBtn')}
        </button>
      </footer>

      {toast && (
        <div className="toast-banner" role="status" aria-live="polite">
          <span>{t(toast.key, toast.vars)}</span>
          {toast.actionKey && toast.onAction && (
            <button
              type="button"
              className="toast-banner__action"
              onClick={() => {
                toast.onAction();
                setToast(null);
              }}
            >
              {t(toast.actionKey)}
            </button>
          )}
        </div>
      )}

      <BookDetailModal
        book={resolvedDetailBook}
        isWishlisted={
          resolvedDetailBook ? library.wishlistIds.includes(resolvedDetailBook.id) : false
        }
        readingEntry={resolvedDetailBook ? library.reading[resolvedDetailBook.id] : null}
        completedEntry={resolvedDetailBook ? library.completed[resolvedDetailBook.id] : null}
        lang={lang}
        onClose={() => setDetailBook(null)}
        onToggleWishlist={handleToggleWishlist}
        onStartReading={handleStartReading}
        onOpenSection={handleOpenSection}
      />

      <AddBookModal
        isOpen={isAddModalOpen}
        lang={lang}
        onClose={() => setIsAddModalOpen(false)}
        onAddBook={handleAddCustomBook}
      />

      <SetPagesModal
        book={pendingPagesModal?.book || null}
        initialMode={pendingPagesModal?.mode || 'start'}
        lang={lang}
        onClose={() => setPendingPagesModal(null)}
        onConfirm={handleConfirmPages}
      />
    </div>
  );
}
