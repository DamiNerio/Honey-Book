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
import { LITERARY_GENRES } from './data/genres';
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
  loadUserLibrary,
  saveUserLibrary,
} from './utils/storage';

const BUILT_IN_GENRE_IDS = new Set(LITERARY_GENRES.map((g) => g.id.toLowerCase()));

export default function App() {
  const [initialBoot] = useState(() => {
    clearLegacySeedStorage();
    const activeUser = getCurrentUser();
    const fallbackLang = getStoredLanguage();
    const loadedLibrary = loadUserLibrary(activeUser.id, fallbackLang);
    const activeLang = loadedLibrary.language || fallbackLang;
    return {
      user: activeUser,
      library: { ...loadedLibrary, language: activeLang },
      lang: activeLang,
    };
  });

  const [user, setUser] = useState(initialBoot.user);
  const [library, setLibrary] = useState(initialBoot.library);
  const [lang, setLang] = useState(initialBoot.lang);
  const [showAuthScreen, setShowAuthScreen] = useState(false);

  const [activeTab, setActiveTab] = useState('directory');
  const [selectedReadingId, setSelectedReadingId] = useState(
    () => Object.keys(initialBoot.library.reading)[0] || null
  );

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

  // Persist current user's library (strictly under honey_book_guest_data in Guest Mode)
  useEffect(() => {
    if (!user?.id) return;
    saveUserLibrary(user.id, library);
  }, [user?.id, library]);

  // Lock background page scroll while any modal is open
  useEffect(() => {
    const hasOpenModal = Boolean(detailBook || isAddModalOpen || pendingPagesModal);
    document.body.classList.toggle('has-open-modal', hasOpenModal);
    return () => {
      document.body.classList.remove('has-open-modal');
    };
  }, [detailBook, isAddModalOpen, pendingPagesModal]);

  // Live timer ticker + immediate refresh when resuming WebView/tab
  useEffect(() => {
    if (!library.timer.isRunning) return undefined;
    const syncNow = () => setNowMs(Date.now());
    syncNow();
    const interval = window.setInterval(syncNow, 500);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        syncNow();
      }
    };
    window.addEventListener('focus', syncNow);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', syncNow);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
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

  const handleChangeLang = (nextLang) => {
    const resolved = nextLang === 'es' ? 'es' : 'en';
    setLang(resolved);
    saveStoredLanguage(resolved);
    setLibrary((prev) =>
      prev.language === resolved ? prev : { ...prev, language: resolved }
    );
  };

  const handleAuthenticated = (authenticatedUser) => {
    const userLib = loadUserLibrary(authenticatedUser.id, lang);
    const nextLang = userLib.language || lang;
    setUser(authenticatedUser);
    setLibrary({ ...userLib, language: nextLang });
    setLang(nextLang);
    saveStoredLanguage(nextLang);
    setSelectedReadingId(Object.keys(userLib.reading)[0] || null);
    setActiveTab('directory');
    setDetailBook(null);
    setIsAddModalOpen(false);
    setPendingPagesModal(null);
    setToast(null);
    setShowAuthScreen(false);
  };

  const handleLogout = () => {
    const guestUser = logoutUser();
    const guestLib = loadUserLibrary(guestUser.id, lang);
    const nextLang = guestLib.language || lang;
    setUser(guestUser);
    setLibrary({ ...guestLib, language: nextLang });
    setLang(nextLang);
    saveStoredLanguage(nextLang);
    setSelectedReadingId(Object.keys(guestLib.reading)[0] || null);
    setActiveTab('directory');
    setDetailBook(null);
    setIsAddModalOpen(false);
    setPendingPagesModal(null);
    setToast(null);
    setShowAuthScreen(false);
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
              completionPercentage: 0,
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

      return {
        ...prev,
        books: nextBooks,
        reading: {
          ...prev.reading,
          [book.id]: {
            ...entry,
            completionPercentage: getCompletionPercentage(entry.currentPage, pageCount),
          },
        },
      };
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

  const handleAddCustomBook = (newBook, addToWishlist, isCustomGenre = false) => {
    const rawGenre = (newBook.genre || '').trim();

    setLibrary((prev) => {
      const existingCustom = Array.isArray(prev.customGenres) ? prev.customGenres : [];
      const alreadyKnown =
        BUILT_IN_GENRE_IDS.has(rawGenre.toLowerCase()) ||
        existingCustom.some((g) => g.toLowerCase() === rawGenre.toLowerCase());

      const nextCustomGenres =
        isCustomGenre && rawGenre && !alreadyKnown
          ? [...existingCustom, rawGenre]
          : existingCustom;

      return {
        ...prev,
        books: [newBook, ...prev.books],
        wishlistIds: addToWishlist ? [newBook.id, ...prev.wishlistIds] : prev.wishlistIds,
        customGenres: nextCustomGenres,
      };
    });

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
    const nextPct = getCompletionPercentage(clampedEnd, book.totalPages);

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
            completionPercentage: nextPct,
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
      showToast('toastSessionLogged', { title: book.title, pct: nextPct });
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
    const fresh = clearUserLibrary(user?.id, lang);
    setLibrary(fresh);
    setSelectedReadingId(null);
    setConfirmClear(false);
    setActiveTab('directory');
    showToast('toastLibraryCleared');
  };

  if (showAuthScreen) {
    return (
      <AuthScreen
        lang={lang}
        onChangeLang={handleChangeLang}
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
        onChangeLang={handleChangeLang}
        user={user}
        onOpenAuth={() => setShowAuthScreen(true)}
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
        <span>Honey Book · {t('footerPrivacy')}</span>
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
        customGenres={library.customGenres}
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
