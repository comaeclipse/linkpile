# Suggested Commands for linkpile Development

## Installation & Setup
```bash
npm install                    # Install all dependencies
npm run prisma:generate       # Generate Prisma client (also runs on postinstall)
cp .env.example .env          # Copy environment template and fill in API keys
```

## Development
```bash
npm run dev                   # Start Vite dev server (http://localhost:3000)
```

## Building
```bash
npm run build                 # Build for production (outputs to dist/)
npm run preview               # Preview production build locally
```

## Prisma Commands
```bash
npx prisma migrate dev --name <migration-name>   # Create and run migration
npx prisma migrate deploy                         # Run pending migrations (prod)
npx prisma studio                                 # Open Prisma Studio GUI for database
npx prisma generate                               # Regenerate Prisma client
```

## Git Commands (Windows)
```bash
git status                    # Check current branch and status
git add .                     # Stage changes
git commit -m "message"       # Commit changes
git push                      # Push to remote
git branch -a                 # List all branches
git checkout -b <branch>      # Create and switch to new branch
```

## Windows Terminal/PowerShell Utilities
```bash
ls                           # List directory contents (same as dir)
cd <path>                    # Change directory
cat <file>                   # Read file contents
Get-Content <file>           # Alternative to cat
```

## Troubleshooting
```bash
npm install                  # Clear node_modules issues
rm -r node_modules           # Remove node_modules (PowerShell: rmdir -Recurse node_modules)
npm cache clean --force      # Clear npm cache
npx prisma migrate reset     # Reset database to initial state (dev only!)
```

## Development Workflow
1. Create feature branch: `git checkout -b feature/my-feature`
2. Install/setup: `npm install && npm run prisma:generate`
3. Start dev server: `npm run dev`
4. Make changes and test in browser (http://localhost:3000)
5. Commit changes: `git add . && git commit -m "Add feature"`
6. Push and create PR: `git push origin feature/my-feature`
