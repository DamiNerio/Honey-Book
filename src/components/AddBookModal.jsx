import { useEffect, useState } from 'react';
import { GENRE_GROUPS, LITERARY_GENRES } from '../data/genres';
import { translate } from '../i18n/translations';
import { CloseIcon } from './Icons';

export default function AddBookModal({ isOpen, lang, onClose, onAddBook }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('Literary Fiction');
  const [totalPages, setTotalPages] = useState('280');
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [cover, setCover] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [addToWishlist, setAddToWishlist] = useState(false);
  const [errorKey, setErrorKey] = useState('');

  const t = (key, vars) => translate(lang, key, vars);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    const cleanAuthor = author.trim();
    const pagesNum = parseInt(totalPages, 10);
    const yearNum = parseInt(year, 10) || new Date().getFullYear();

    if (!cleanTitle) {
      setErrorKey('addErrTitle');
      return;
    }
    if (!cleanAuthor) {
      setErrorKey('addErrAuthor');
      return;
    }
    if (Number.isNaN(pagesNum) || pagesNum < 1 || pagesNum > 10000) {
      setErrorKey('addErrPages');
      return;
    }

    onAddBook(
      {
        id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: cleanTitle,
        author: cleanAuthor,
        genre,
        year: yearNum,
        totalPages: pagesNum,
        cover: cover.trim(),
        synopsis: synopsis.trim(),
      },
      addToWishlist
    );

    setTitle('');
    setAuthor('');
    setGenre('Literary Fiction');
    setTotalPages('280');
    setYear(String(new Date().getFullYear()));
    setCover('');
    setSynopsis('');
    setAddToWishlist(false);
    setErrorKey('');
    onClose();
  };

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-book-modal-title"
      onClick={onClose}
    >
      <div className="modal-panel modal-panel--form" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          id="add-book-close"
          className="modal-close"
          onClick={onClose}
          aria-label={t('close')}
        >
          <CloseIcon size={18} />
        </button>

        <div className="modal-header">
          <span className="eyebrow-label">{t('addEyebrow')}</span>
          <h2 id="add-book-modal-title" className="modal-title">
            {t('addTitle')}
          </h2>
        </div>

        <form className="stack-form" onSubmit={handleSubmit} noValidate>
          <div className="form-grid-2">
            <div className="field">
              <label htmlFor="add-book-title">{t('addBookTitleLabel')}</label>
              <input
                id="add-book-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('addBookTitlePlaceholder')}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="add-book-author">{t('addBookAuthorLabel')}</label>
              <input
                id="add-book-author"
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder={t('addBookAuthorPlaceholder')}
                required
              />
            </div>
          </div>

          <div className="form-grid-3">
            <div className="field">
              <label htmlFor="add-book-genre">{t('addBookGenreLabel')}</label>
              <select
                id="add-book-genre"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
              >
                {GENRE_GROUPS.map((group) => (
                  <optgroup key={group.id} label={group[lang] || group.en}>
                    {LITERARY_GENRES.filter((item) => item.group === group.id).map((item) => (
                      <option key={item.id} value={item.id}>
                        {item[lang] || item.en}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="add-book-pages">{t('addBookPagesLabel')}</label>
              <input
                id="add-book-pages"
                type="number"
                min="1"
                max="10000"
                value={totalPages}
                onChange={(e) => setTotalPages(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="add-book-year">{t('addBookYearLabel')}</label>
              <input
                id="add-book-year"
                type="number"
                min="1"
                max="2100"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="add-book-cover">{t('addBookCoverLabel')}</label>
            <input
              id="add-book-cover"
              type="url"
              value={cover}
              onChange={(e) => setCover(e.target.value)}
              placeholder={t('addBookCoverPlaceholder')}
            />
          </div>

          <div className="field">
            <label htmlFor="add-book-synopsis">{t('addBookSynopsisLabel')}</label>
            <textarea
              id="add-book-synopsis"
              rows="3"
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              placeholder={t('addBookSynopsisPlaceholder')}
            />
          </div>

          <label className="checkbox-row" htmlFor="add-book-wishlist">
            <input
              id="add-book-wishlist"
              type="checkbox"
              checked={addToWishlist}
              onChange={(e) => setAddToWishlist(e.target.checked)}
            />
            <span>{t('addBookWishlistCheck')}</span>
          </label>

          {errorKey && (
            <p className="form-error" role="alert">
              {t(errorKey)}
            </p>
          )}

          <div className="modal-footer">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              {t('cancel')}
            </button>
            <button type="submit" id="add-book-submit" className="btn btn--primary">
              {t('addBookSubmit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
