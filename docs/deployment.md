# Deployment: GitHub → Turso → Vercel

**Live:** https://request-hub-ten.vercel.app (Vercel, deployed from `main`;
data in Turso).

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
   Vercel functions run. The live app uses Turso `aws-us-east-1` with Vercel's
   default `iad1`, both in Washington, D.C.
3. Copy the database **URL** (`libsql://request-hub-<org>.turso.io`) and create
   a **token** (read & write).
4. Create the tables and add the demo data. **On Windows, the simplest way** is
   the helper script, which asks for the token at a hidden prompt and keeps it
   only in that process:
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\scripts\setup-turso.ps1 -DatabaseUrl "libsql://request-hub-<org>.<region>.turso.io"
   ```
   Or by hand. Run this in your own terminal,
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

## Checking the database: /api/health
`GET /api/health` answers `{"status":"ok","database":"turso","requests":30}` when
all is well, or `503` with a safe category and the fix, never the URL, token
or raw error:

| `problem` | Meaning | Fix |
|---|---|---|
| `schema-missing` | Reached and authorised, but no tables | Run the setup in 2.4 against **the same** database Vercel uses |
| `auth-failed` | The token was rejected | New token in Turso → Vercel → Redeploy |
| `unreachable` | Wrong URL (Turso answers 404) or wrong scheme | Fix `DATABASE_URL` → Redeploy |

**Lesson from the first deploy:** make sure the setup in 2.4 and Vercel use
the same database. Creating a second database by accident left Vercel pointed
at an empty one; `/api/health` showed `schema-missing` straight away, and
running the setup against that exact URL fixed it with no redeploy.
Vercel environment variable changes only apply to new deployments.

## Later schema changes
1. Locally: `npm run db:migrate -- --name <change>` creates the migration.
2. Before deploying the code: run `npm run db:deploy` against Turso (as in 2.4).
3. Push; Vercel deploys.

## Smoke test after deploying
- Dashboard loads with the demo data; the header logo shows the completed share.
- Create a request → appears in the list; change its status → dashboard updates.
- Reload and open the URL on another device: the data is still there (R8).
