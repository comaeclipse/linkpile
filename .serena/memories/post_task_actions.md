# Post-Task Actions

## After Completing Code Changes

### Code Quality
- Verify TypeScript compilation has no errors
- Ensure new code follows the style conventions in `code_style_and_conventions.md`
- Add types to new functions/components (avoid `any`)

### Testing & Building
1. **Dev Build**: Ensure `npm run dev` starts without errors
2. **Production Build**: Run `npm run build` to verify build succeeds
3. **Manual Testing**: Test changes in browser at http://localhost:3000
4. **Database**: If schema changes made, run appropriate Prisma migrations

### Git & Commits
1. Check `git status` to see all changes
2. Stage changes: `git add <files>` or `git add .`
3. Create descriptive commit message: `git commit -m "type: description"`
4. Push to branch: `git push origin <branch-name>`
5. Create/update pull request if needed

### Common Commit Types
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring without behavior change
- `style:` - Formatting, missing semicolons, etc.
- `docs:` - Documentation changes
- `chore:` - Build, deps, tooling updates

### If Database Schema Changed
1. Create migration: `npx prisma migrate dev --name <descriptive-name>`
2. Verify migration file in `prisma/migrations/<timestamp>-<name>/migration.sql`
3. Update `.env.example` if new env vars needed
4. Commit both `schema.prisma` and migration folder

### API Endpoint Changes
1. Update corresponding service in `/services` if logic changed
2. Update corresponding API handler in `/api` if routes changed
3. Test endpoint using browser fetch or API client (Postman, curl, etc.)
4. Update types in `types.ts` if request/response shapes changed

### Environment Variable Changes
1. Update `.env.example` with new variables
2. Document new variables in README or code comments
3. Ensure CI/CD pipeline knows about new vars (if applicable)
4. Never commit actual `.env` file with real API keys

## Development Workflow Summary
**Code → TypeScript Check → Build → Manual Test → Commit → Push**
