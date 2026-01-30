# linkpile Project Overview

## Project Purpose
A minimal social bookmarking app that allows users to save, organize, and tag bookmarks. Features include:
- Bookmark management (create, read, update, delete)
- Tag-based organization with AI-powered tag suggestions
- Bookmark reading status tracking
- Layout/widget organization system
- AI integration for tag/description suggestions (Gemini and OpenAI)
- Public/private bookmark visibility

## Tech Stack

### Frontend
- **React 19.2.0** with TypeScript (~5.8.2)
- **Vite 6.2.0** for bundling and dev server
- **Tailwind CSS 3.4.16** for styling
- **PostCSS 8.4.49** with Autoprefixer

### Backend
- **Node.js** with TypeScript
- **Neon PostgreSQL** database
- **Prisma 6.2.1** for ORM
- **Vite** server for development (port 3000)

### AI/APIs
- **Google Generative AI** (@google/genai ^1.30.0) for tag/description suggestions
- **OpenAI API** (^6.9.1) for del.icio.us-style tag suggestions

## Database Schema

### Core Models
- **Bookmark**: Main model with fields for url, title, description, tags, isRead, isPublic, timestamps
- **Layout**: Stores UI layout state (tabs, widgets, positions)

### Future Plans (commented out)
- Category model for relational category management
- Tag model for relational tag management

## Project Structure
- `/api` - Backend endpoints (bookmarks, gemini, openai-tags, fetch-title, layout)
- `/components` - React components (AddBookmarkForm, BookmarkList, Header, Organizer, TagCloud, Ticker)
- `/services` - Service layer (bookmarkService, geminiService, openaiService, layoutService, prismaClient)
- `/prisma` - Prisma schema and migrations
- Root level: App.tsx, types.ts, constants.ts, main styling

## Configuration Files
- `tsconfig.json`: ES2022 target, React JSX, path alias `@/*`
- `vite.config.ts`: Dev server on port 3000, React plugin, path alias setup
- `prisma.config.ts`: PostgreSQL datasource with DATABASE_URL and DIRECT_URL
- `tailwind.config.js`: Tailwind configuration
- `postcss.config.cjs`: PostCSS with Tailwind plugin
