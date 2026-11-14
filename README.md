# Honey Book

A minimalist, dark-themed, offline-first personal book tracking app with muted purple accents, bilingual English/Spanish support, and Android `.apk` packaging readiness.

## Features

- **Instant Guest Mode & Optional Accounts**: Boots straight into active Guest mode with zero mandatory login. Optionally open the Account switcher to create separate local reader shelves on the same device.
- **100% On-Device Persistence**: Your directory, wishlist, page/percentage progress, reading session timers, completed reviews, custom genres, and language preference persist offline in device `localStorage` (`honey_book_guest_data`).
- **Book Search & Directory**: Search any title or author dynamically (powered behind the scenes by the Google Books API), view covers, synopses, and page counts, or create custom books with expanded literary genres and custom genre tags.
- **Personal Wishlist**: Save titles from search results or custom entries to read next and start reading with a single tap.
- **Reading Progress & Live Timer**: Built-in `HH:MM:SS` session timer and page-progress logger that calculates completion percentage automatically and logs every reading session.
- **Completed Books & Reflections**: Books reaching 100% completion automatically move to the **Completed** shelf, displaying accumulated total reading time across all sessions alongside a personal review and rating editor.
- **Bilingual Interface (EN / ES)**: Switch seamlessly between English and Spanish at any time.
- **PWA & Android APK Ready**: Configured with a standalone web manifest, offline Service Worker, mobile safe-area & touch optimization, and a Capacitor + GitHub Actions pipeline (`.github/workflows/build-apk.yml`) that builds and uploads `app-debug.apk` on push to `main`.

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
- `npm run cap:sync` — Build `dist/` and sync assets into Capacitor Android

