import { useEffect, useState } from 'react';
import { CloseIcon } from './Icons';

export default function ApiKeyModal({ isOpen, apiKey, onClose, onSaveApiKey }) {
  const [draftKey, setDraftKey] = useState(apiKey || '');

  useEffect(() => {
    setDraftKey(apiKey || '');
  }, [apiKey, isOpen]);

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
    onSaveApiKey(draftKey.trim());
    onClose();
  };

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="api-key-modal-title"
      onClick={onClose}
    >
      <div className="modal-panel modal-panel--compact" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Close API key settings"
        >
          <CloseIcon size={18} />
        </button>

        <div className="modal-header">
          <span className="eyebrow-label">Google Books API</span>
          <h2 id="api-key-modal-title" className="modal-title">
            API Key Configuration
          </h2>
          <p className="modal-desc">
            Google Books works without a key in most browsers, but if you encounter shared-IP quota limits (HTTP 429), add your personal Google Books API key below. Saved only in your browser.
          </p>
        </div>

        <form className="stack-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="google-books-api-key-input">Google Books API Key (optional)</label>
            <input
              id="google-books-api-key-input"
              type="password"
              value={draftKey}
              onChange={(e) => setDraftKey(e.target.value)}
              placeholder="AIzaSy..."
              autoComplete="off"
            />
          </div>

          <div className="modal-footer">
            {apiKey && (
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => {
                  onSaveApiKey('');
                  setDraftKey('');
                  onClose();
                }}
              >
                Clear Key
              </button>
            )}
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" id="save-api-key-btn" className="btn btn--primary">
              Save Key
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
