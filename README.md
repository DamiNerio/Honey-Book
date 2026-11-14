# Book Violet

A minimalist, nocturnal book tracking web application built with React, Vite, and Vanilla CSS in dark obsidian surfaces and muted violet accents.

## Features

- **Google Books Search & Directory**: Search any book or author in real time via the Google Books API (`https://www.googleapis.com/books/v1/volumes`), automatically retrieving title, cover artwork, synopsis, and total page count. Browse your saved & curated shelf, filter by genre, or add custom editions.
- **Personal Wishlist**: Bookmark books from Google Books search results or the curated directory into a personal reading queue, then start reading with one click.
- **Reading Progress & Live Session Timer**: Built-in `HH:MM:SS` reading timer (persisted across tab switches and refreshes) alongside page-number session logging that automatically computes completion percentage and maintains a full session log.
- **Completed Shelf & Personal Reviews**: When a book reaches 100% completion, it automatically moves to the **Completed** section, displaying accumulated total reading time across all sessions and an inline personal review & rating editor.

## Local Development

```bash
npm install
npm run dev
```

Optional environment variable in `.env.local` if you want a preconfigured Google Books API key (you can also set one directly inside the app's **API Key** modal):

```bash
VITE_GOOGLE_BOOKS_API_KEY=your_key_here
```

## Scripts

- `npm run dev` — Start the Vite development server
- `npm run build` — Build the production bundle into `dist/`
- `npm run lint` — Run Oxlint checks
