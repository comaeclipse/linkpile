# Code Style and Conventions

## TypeScript
- **Target**: ES2022
- **Module System**: ESNext (modern imports/exports)
- **JSX**: React JSX (automatic runtime)
- **Path Aliases**: `@/*` points to project root
- **Type Checking**: skipLibCheck enabled for faster builds

## Naming Conventions
- **React Components**: PascalCase (e.g., AddBookmarkForm, BookmarkList, Header)
- **Services**: camelCase with "Service" suffix (e.g., bookmarkService, geminiService)
- **API Routes**: kebab-case paths (e.g., /api/openai-tags, /api/gemini)
- **Files**: Match component/function names (e.g., AddBookmarkForm.tsx, bookmarkService.ts)

## Code Organization
- React components in `/components`
- API handlers in `/api`
- Business logic in `/services`
- Shared types in `types.ts`
- Constants in `constants.ts`
- Styling with Tailwind CSS (utility-first approach)

## Type Definitions
- Core types defined in `types.ts`:
  - `Bookmark` interface: Defines bookmark structure
  - `SuggestionResponse` interface: For AI API responses
  - `TagCount` interface: For tag frequency/cloud data

## Database & ORM
- **Prisma** for database access
- Use prisma client from `services/prismaClient.ts`
- Models: Bookmark, Layout
- Pagination not yet implemented (future consideration)

## Environment Variables
- Stored in `.env` (gitignored, never commit)
- Required variables:
  - `GEMINI_API_KEY`: For Gemini tag/description suggestions
  - `OPENAI_API_KEY`: For OpenAI tag suggestions
  - `DATABASE_URL`: Neon Postgres connection URL
  - `DIRECT_URL`: Direct Neon Postgres connection URL

## API Patterns
- REST endpoints at `/api/*`
- Bookmarks API: GET/POST/PATCH/DELETE at `/api/bookmarks`
- AI endpoints: `/api/gemini` and `/api/openai-tags`
- Frontend fallback: Uses local storage if API calls fail

## React Patterns
- Functional components with hooks
- State management: React hooks (useState, useEffect)
- Component composition over prop drilling
