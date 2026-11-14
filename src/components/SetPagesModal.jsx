import { useEffect, useState } from 'react';
import { CloseIcon } from './Icons';

export default function SetPagesModal({ book, initialMode = 'start', onClose, onConfirm }) {
  const [pagesInput, setPagesInput] = useState(
    book?.totalPages && book.totalPages > 0 ? String(book.totalPages) : '280'
  );
  const [error, setError] = useState('');

  useEffect(() => {
    if (!book) return;
    setPagesInput(book.totalPages && book.totalPages > 0 ? String(book.totalPages) : '280');
    setError('');
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
      setError('Enter a valid total page count between 1 and 10,000.');
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
          aria-label="Close page count prompt"
        >
          <CloseIcon size={18} />
        </button>

        <div className="modal-header">
          <span className="eyebrow-label">Edition Details</span>
          <h2 id="set-pages-title" className="modal-title">
            {initialMode === 'edit' ? 'Update Total Pages' : 'Confirm Page Count'}
          </h2>
          <p className="modal-desc">
            {initialMode === 'edit'
              ? `Adjust the total page count for "${book.title}" to match your edition.`
              : `Google Books did not specify a page count for this edition of "${book.title}". Enter its page count to calculate completion percentage accurately.`}
          </p>
        </div>

        <form className="stack-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="edition-pages-input">Total Pages</label>
            <input
              id="edition-pages-input"
              type="number"
              min="1"
              max="10000"
              value={pagesInput}
              onChange={(e) => {
                setError('');
                setPagesInput(e.target.value);
              }}
              className="mono-num"
              autoFocus
            />
          </div>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <div className="modal-footer">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" id="confirm-pages-btn" className="btn btn--primary">
              {initialMode === 'edit' ? 'Save Page Count' : 'Start Reading'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
