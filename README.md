# Book Violet

A minimalist, dark-themed personal book tracking web application with muted purple accents and English/Spanish bilingual support.

## Features

- **Personal Accounts**: Sign up and log in with isolated personal accounts so each reader has their own private library, wishlist, reading progress, and reviews.
- **Book Search & Directory**: Search any title or author dynamically (powered behind the scenes by the Google Books API), view covers, synopses, and page counts, or create custom books across an expanded literary genre catalog.
- **Personal Wishlist**: Save titles from search results or custom entries to read next and start reading with a single click.
- **Reading Progress & Live Timer**: Built-in `HH:MM:SS` session timer and page-progress logger that calculates completion percentage automatically and logs every reading session.
- **Completed Books & Reflections**: Books reaching 100% completion automatically move to the **Completed** shelf, displaying accumulated total reading time across all sessions alongside a personal review and rating editor.
- **Bilingual Interface (EN / ES)**: Switch seamlessly between English and Spanish at any time.

## Local Development

```bash
npm install
npm run dev
```

Optional environment variable in `.env.local` if you want to configure a Google Books API key at build/dev time without exposing any settings in the UI:

```bash
VITE_GOOGLE_BOOKS_API_KEY=your_key_here
```

## Scripts

- `npm run dev` — Start the Vite development server
- `npm run build` — Build the production bundle into `dist/`
- `npm run lint` — Run Oxlint checks
