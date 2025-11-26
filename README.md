# link.pile

A minimal social bookmarking app. Frontend runs on Vite + React, data persists to Neon Postgres via Prisma, and Gemini powers tag/description suggestions.

## Setup
- Install deps: `npm install`
- Copy `.env.example` to `.env` and set:
  - `GEMINI_API_KEY` – Gemini key
  - `DATABASE_URL` and `DIRECT_URL` – Neon Postgres URLs
- Generate Prisma client: `npm run prisma:generate`
- Run dev server: `npm run dev`

Secrets live only in `.env` (gitignored). Rotate any keys that were previously committed.
