# link.pile

A minimal social bookmarking app. Frontend runs on Vite + React, data persists to Neon Postgres via Prisma, and Gemini powers tag/description suggestions.

## Setup
- Install deps: `npm install`
- Copy `.env.example` to `.env` and set:
  - `GEMINI_API_KEY` – Gemini key
  - `DATABASE_URL` and `DIRECT_URL` – Neon Postgres URLs
- Generate Prisma client: `npm run prisma:generate`
- Run dev server: `npm run dev`

### API
- Bookmarks API lives at `/api/bookmarks` (GET, POST, PATCH/PUT, DELETE). It uses Prisma + Neon and the same env vars above.
- Frontend uses that API by default and falls back to local storage if the API call fails.

Secrets live only in `.env` (gitignored). Rotate any keys that were previously committed.
