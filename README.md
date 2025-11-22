# link.pile

A simple and elegant bookmarking service inspired by del.icio.us, built with Next.js 15, Prisma, and Neon PostgreSQL.

## Features

- Bookmark links with title, URL, and description
- Organize with categories and tags (multiple per bookmark)
- Search functionality across title, URL, description, and tags
- Public/Private bookmark toggle
- Classic del.icio.us white and blue theme
- Fully responsive design

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Neon PostgreSQL
- **ORM**: Prisma
- **Deployment**: Vercel

## Local Development

### Prerequisites

- Node.js 18+ installed
- A Neon PostgreSQL database (get one free at [neon.tech](https://neon.tech))

### Setup

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Set up your environment variables:

Create a `.env` file and add your Neon database URL:

```env
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
```

3. Initialize the database:

```bash
npx prisma generate
npx prisma db push
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses three main models:

- **Bookmark**: Stores URL, title, description, public/private flag
- **Tag**: Many-to-many relationship with bookmarks
- **Category**: Many-to-many relationship with bookmarks

## Deployment to Vercel

1. Push your code to GitHub

2. Import your repository in Vercel

3. Add your `DATABASE_URL` environment variable in Vercel project settings

4. Deploy! Vercel will automatically:
   - Install dependencies
   - Build the Next.js app
   - Deploy to production

5. After deployment, run Prisma migrations:

```bash
npx prisma db push
```

Or set up a build script in Vercel to run migrations automatically.

## Usage

### Adding a Bookmark

1. Click "+ Add New Bookmark"
2. Enter the URL and title (required)
3. Optionally add description, categories (comma-separated), and tags (comma-separated)
4. Toggle public/private as needed
5. Click "Add Bookmark"

### Searching

Use the search bar in the header to search across all bookmark fields and tags.

### Filtering

- Click categories in the sidebar to filter by category
- Click tags to filter by tag
- Click "All" to clear category filter

### Editing/Deleting

Each bookmark has "Edit" and "Delete" buttons. Editing opens the form with pre-filled values.

## Project Structure

```
delicious/
├── app/
│   ├── api/
│   │   ├── bookmarks/      # Bookmark CRUD endpoints
│   │   ├── categories/     # Category list endpoint
│   │   └── tags/           # Tag list endpoint
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx            # Main page with state management
├── components/
│   ├── AddBookmarkForm.tsx
│   ├── BookmarkList.tsx
│   ├── Header.tsx
│   └── Sidebar.tsx
├── lib/
│   └── prisma.ts           # Prisma client instance
├── prisma/
│   └── schema.prisma       # Database schema
└── package.json
```

## License

MIT
