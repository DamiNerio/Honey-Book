import { useEffect, useState } from 'react';
import { GENRES } from '../data/booksSeed';
import { CloseIcon } from './Icons';

export default function AddBookModal({ isOpen, onClose, onAddBook }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('Literary Fiction');
  const [totalPages, setTotalPages] = useState('280');
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [cover, setCover] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [addToWishlist, setAddToWishlist] = useState(false);
  const [error, setError] = useState('');

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
      setError('Please enter a book title.');
      return;
    }
    if (!cleanAuthor) {
      setError('Please enter the author name.');
      return;
    }
    if (Number.isNaN(pagesNum) || pagesNum < 1 || pagesNum > 5000) {
      setError('Please enter a valid page count between 1 and 5000.');
      return;
    }

    onAddBook(
      {
        id: `custom-${Date.now()}`,
        title: cleanTitle,
        author: cleanAuthor,
        genre,
        year: yearNum,
        totalPages: pagesNum,
        cover: cover.trim(),
        synopsis:
          synopsis.trim() ||
          `A personal edition of ${cleanTitle} by ${cleanAuthor}, added to your reading library.`,
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
    setError('');
    onClose();
  };

  const genreOptions = GENRES.filter((g) => g !== 'All');

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
          aria-label="Close add book form"
        >
          <CloseIcon size={18} />
        </button>

        <div className="modal-header">
          <span className="eyebrow-label">Custom Entry</span>
          <h2 id="add-book-modal-title" className="modal-title">
            Add Book to Directory
          </h2>
        </div>

        <form className="stack-form" onSubmit={handleSubmit} noValidate>
          <div className="form-grid-2">
            <div className="field">
              <label htmlFor="add-book-title">Title</label>
              <input
                id="add-book-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Solaris"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="add-book-author">Author</label>
              <input
                id="add-book-author"
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g., Stanisław Lem"
                required
              />
            </div>
          </div>

          <div className="form-grid-3">
            <div className="field">
              <label htmlFor="add-book-genre">Genre</label>
              <select
                id="add-book-genre"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
              >
                {genreOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="add-book-pages">Total Pages</label>
              <input
                id="add-book-pages"
                type="number"
                min="1"
                max="5000"
                value={totalPages}
                onChange={(e) => setTotalPages(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="add-book-year">Year</label>
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
            <label htmlFor="add-book-cover">Cover Image URL (optional)</label>
            <input
              id="add-book-cover"
              type="url"
              value={cover}
              onChange={(e) => setCover(e.target.value)}
              placeholder="Leave blank for a minimalist clothbound cover"
            />
          </div>

          <div className="field">
            <label htmlFor="add-book-synopsis">Synopsis</label>
            <textarea
              id="add-book-synopsis"
              rows="3"
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              placeholder="Short summary of the book's premise or themes..."
            />
          </div>

          <label className="checkbox-row" htmlFor="add-book-wishlist">
            <input
              id="add-book-wishlist"
              type="checkbox"
              checked={addToWishlist}
              onChange={(e) => setAddToWishlist(e.target.checked)}
            />
            <span>Also add directly to my Wishlist</span>
          </label>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <div className="modal-footer">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" id="add-book-submit" className="btn btn--primary">
              Add to Directory
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
