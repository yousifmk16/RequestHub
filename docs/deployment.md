# Deployment: GitHub → Turso → Vercel

The app runs on Vercel and stores data in Turso (hosted SQLite/libSQL). The same
Prisma schema and driver serve the local SQLite file and Turso
(see decisions.md D1). Total time is about 15 minutes, using free tiers.

## 1. GitHub
1. Create an **empty** repository (no README, licence or .gitignore), e.g.
   `request-hub`.
2. Push:
   ```bash
   git remote add origin https://github.com/<you>/request-hub.git
   git push -u origin main
   ```
   CI (`.github/workflows/ci.yml`) runs lint, typecheck, unit tests, build and
   e2e on every push.

## 2. Turso database
1. Sign in at https://app.turso.tech (GitHub sign-in works).
2. **Create database**, e.g. `request-hub`. Pick a region close to where the
   Vercel functions will run (step 3), e.g. Frankfurt for both.
3. Copy the database **URL** (`libsql://request-hub-<org>.turso.io`) and create
   a **token** (read & write).
4. Create the tables and add the demo data. Run this in your own terminal,
   with the values held only for that session, not in `.env` (otherwise
   `npm run dev` would use the production database):
   ```powershell
   $env:DATABASE_URL = "libsql://request-hub-<org>.turso.io"
   $env:DATABASE_AUTH_TOKEN = "<token>"
   npm run db:deploy        # applies prisma/migrations, safe to re-run
   npx tsx prisma/seed.ts   # 30 demo requests, only if the table is empty
   Remove-Item Env:DATABASE_URL, Env:DATABASE_AUTH_TOKEN
   ```
   `prisma migrate deploy` can't connect to `libsql://` URLs, so
   `scripts/db-deploy.mjs` applies each migration in a transaction and records
   it in `_request_hub_migrations`.

## 3. Vercel
1. Sign in at https://vercel.com with GitHub → **Add New → Project** → import
   the repository. The Next.js preset needs no changes.
2. **Environment Variables** (Production and Preview):
   - `DATABASE_URL` = the `libsql://…` URL
   - `DATABASE_AUTH_TOKEN` = the token
3. **Deploy.** `postinstall` runs `prisma generate`; the build doesn't touch the
   database, because every read happens at request time (D4).
4. Optional: **Settings → Functions → Region**: pick the region nearest the
   Turso database to cut query latency.

If the variables are missing, the build fails with
"DATABASE_URL is not set…" instead of deploying a broken app.

## Later schema changes
1. Locally: `npm run db:migrate -- --name <change>` creates the migration.
2. Before deploying the code: run `npm run db:deploy` against Turso (as in 2.4).
3. Push; Vercel deploys.

## Smoke test after deploying
- Dashboard loads with the demo data; the header logo shows the completed share.
- Create a request → appears in the list; change its status → dashboard updates.
- Reload and open the URL on another device: the data is still there (R8).
