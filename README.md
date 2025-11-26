<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1mHXjRbwxPUlOv8RKyGTuGwXwG8OXedLw

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and fill in:
   - `GEMINI_API_KEY` (Gemini API key used by the client)
   - `DATABASE_URL` and `DIRECT_URL` (Neon Postgres connection strings for Prisma)
3. Generate Prisma client (after the DB URLs are set): `npm run prisma:generate`
4. Run the app: `npm run dev`

> `.env` and `.env.*` are gitignored so credentials stay local. Rotate the keys that shipped in the previous `.env` if they were ever pushed upstream.
