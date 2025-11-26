# link.pile

A minimal social bookmarking app. Frontend runs on Vite + React, data persists to Neon Postgres via Prisma, and Gemini powers tag/description suggestions. OpenAI can also suggest del.icio.us-style tags via `/api/openai-tags`.

## Setup
- Install deps: `npm install`
- Copy `.env.example` to `.env` and set:
  - `GEMINI_API_KEY` — Gemini key
  - `OPENAI_API_KEY` — OpenAI key (for the del.icio.us-style tagger)
  - `DATABASE_URL` and `DIRECT_URL` — Neon Postgres URLs
- Generate Prisma client: `npm run prisma:generate`
- Run dev server: `npm run dev`

### API
- Bookmarks API lives at `/api/bookmarks` (GET, POST, PATCH/PUT, DELETE). It uses Prisma + Neon and the same env vars above.
- Frontend uses that API by default and falls back to local storage if the API call fails.
- Tagging API: `/api/openai-tags` (OpenAI del.icio.us-style tags) and `/api/gemini` (Gemini tags/description).

Secrets live only in `.env` (gitignored). Rotate any keys that were previously committed.
