import { useEffect, useState } from 'react';
import { translate } from '../i18n/translations';
import { CloseIcon } from './Icons';

export default function SetPagesModal({ book, initialMode = 'start', lang, onClose, onConfirm }) {
  const [pagesInput, setPagesInput] = useState(
    book?.totalPages && book.totalPages > 0 ? String(book.totalPages) : '280'
  );
  const [errorKey, setErrorKey] = useState('');

  const t = (key, vars) => translate(lang, key, vars);

  useEffect(() => {
    if (!book) return;
    setPagesInput(book.totalPages && book.totalPages > 0 ? String(book.totalPages) : '280');
    setErrorKey('');
  }, [book]);

  useEffect(() => {
    if (!book) return undefined;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [book, onClose]);

  if (!book) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const num = parseInt(pagesInput, 10);
    if (Number.isNaN(num) || num < 1 || num > 10000) {
      setErrorKey('pagesModalErr');
      return;
    }
    onConfirm(book, num);
  };

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="set-pages-title"
      onClick={onClose}
    >
      <div className="modal-panel modal-panel--compact" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label={t('close')}
        >
          <CloseIcon size={18} />
        </button>

        <div className="modal-header">
          <span className="eyebrow-label">{t('pagesModalEyebrow')}</span>
          <h2 id="set-pages-title" className="modal-title">
            {initialMode === 'edit' ? t('pagesModalTitleEdit') : t('pagesModalTitleStart')}
          </h2>
          <p className="modal-desc">
            {initialMode === 'edit'
              ? t('pagesModalDescEdit', { title: book.title })
              : t('pagesModalDescStart', { title: book.title })}
          </p>
        </div>

        <form className="stack-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="edition-pages-input">{t('pagesModalInputLabel')}</label>
            <input
              id="edition-pages-input"
              type="number"
              min="1"
              max="10000"
              value={pagesInput}
              onChange={(e) => {
                setErrorKey('');
                setPagesInput(e.target.value);
              }}
              className="mono-num"
              autoFocus
            />
          </div>

          {errorKey && (
            <p className="form-error" role="alert">
              {t(errorKey)}
            </p>
          )}

          <div className="modal-footer">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              {t('cancel')}
            </button>
            <button type="submit" id="confirm-pages-btn" className="btn btn--primary">
              {initialMode === 'edit' ? t('pagesModalSave') : t('pagesModalStart')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
