# Quick Start Guide

Get link.pile up and running in minutes!

## Step 1: Get a Free Neon Database

1. Go to [neon.tech](https://neon.tech) and sign up for free
2. Create a new project
3. Copy your connection string (it looks like: `postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`)

## Step 2: Configure Your Environment

1. Open the `.env` file in the root directory
2. Replace the placeholder with your Neon connection string:

```env
DATABASE_URL="postgresql://your-actual-neon-connection-string"
```

## Step 3: Set Up the Database

Run this command to create the database tables:

```bash
npm run db:push
```

## Step 4: (Optional) Add Sample Data

Want some sample bookmarks to start with?

```bash
npm run db:seed
```

This will add a few example bookmarks about Next.js, React, and TypeScript.

## Step 5: Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

## Next Steps

- Click "+ Add New Bookmark" to add your first bookmark
- Try searching, filtering by categories/tags
- Toggle bookmarks between public/private
- Edit or delete bookmarks using the buttons

## Deploying to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add your `DATABASE_URL` environment variable in Vercel settings
4. Deploy!

After deployment, run `npm run db:push` one more time to initialize the production database.

## Troubleshooting

**"Can't reach database server"**
- Make sure your DATABASE_URL is correct
- Check that your Neon database is active
- Verify the connection string includes `?sslmode=require`

**"Module not found" errors**
- Run `npm install` again
- Delete `node_modules` and `.next` folders, then run `npm install`

**Prisma Client errors**
- Run `npx prisma generate`
- Make sure you ran `npm run db:push`

## Useful Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:push` - Push schema changes to database
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio (database GUI)

Enjoy your new bookmarking app!
