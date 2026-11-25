# Request Hub — Build Plan

> **Note:** this is the original plan, kept as written. During the build,
> the equivalent work used the Next.js docs bundled in `node_modules`, the
> installed type definitions, the shadcn CLI, the Playwright test runner and
> the built-in browser of the Claude desktop app. The MCP servers in
> `.mcp.json` (context7, shadcn, Playwright, next-devtools) were then used as
> a final verification pass. [ai-log.md](ai-log.md) records what each one
> checked.

## Context
This is a recruitment assessment. The task is to build an Employee Request Management System ("Request Hub") with AI tools and deliver a GitHub repo, a deployed URL and a README. The groundwork is already committed: `CLAUDE.md`, `docs/requirements.md` (R1–R8 with acceptance checks), `docs/priorities.md`, `docs/decisions.md`, `docs/ai-log.md`, the two project skills and `.mcp.json`. There is no app code yet, and `docs/plan.md` (which CLAUDE.md refers to) does not exist.

**What the work is judged on:** quality, not speed. The seven evaluation criteria drive every step:
- functional completeness and reliability
- UI/UX
- effective use of AI tools
- code quality
- problem-solving
- attention to detail
- being able to explain and modify the code

There is enough time to do this properly. Each phase must meet the Definition of Done before the next one starts.

**Hard constraint: zero setup for reviewers.** Anyone can open the deployed link, and anyone can clone the repo and run `npm install` then `npm run dev` with no database, Docker or `.env` setup.
→ Switch from PostgreSQL/Neon to **SQLite through Prisma**. Locally the database is a file that gets created and seeded automatically. The Vercel deployment uses **Turso** (hosted SQLite). One schema and one driver (`@prisma/adapter-libsql`) handle `file:./dev.db` and `libsql://…`. This also makes tests and CI trivial, because they need no database server.

## Architecture (as in CLAUDE.md)
UI → API route → Zod → `src/lib/services/requests.ts` → Prisma (libsql adapter) → SQLite/Turso.
- Server Components read data through the service. Every write goes through `/api/requests*`.
- Filters, search and sort are stored in URL search params.

## How every phase is run (covers the AI-tools, problem-solving and explainability criteria)
1. State the approach and trade-offs in 2–3 lines, and record any real decision in `docs/decisions.md`.
2. Check library APIs with **context7** first: Next 16, Prisma 7, shadcn, RHF and Zod 4 all changed recently.
3. Build in small steps, adding UI pieces through the **shadcn MCP**.
4. Verify with **next-devtools MCP** (build and runtime errors) and **Playwright MCP** (desktop and 375px, console clean).
5. Run the **pre-submit-review** skill, then lint and tests, then make a small commit with a clear message.
6. Log what the AI got wrong and how it was caught in `docs/ai-log.md`. Write a short summary of the change: files touched and how the data flows.

---

## Phase 0: Docs alignment
- Create `docs/plan.md` from this plan.
- In `CLAUDE.md` and `requirements.md` (R8), replace Postgres/Neon with SQLite/Turso through the libsql adapter.
- Add **D1 — SQLite + Turso vs Postgres + Neon** to `docs/decisions.md`. Reason: zero-setup clone-and-run and a database-free CI. Trade-offs: SQLite `contains` is only case-insensitive for ASCII, and migrations have to be applied to Turso by hand.

## Phase 1: Scaffold and tooling
- `create-next-app` (TypeScript strict, Tailwind, App Router, `src/`, ESLint), then `shadcn init`.
- Dependencies, each with its reason recorded in decisions.md:
  - `prisma`, `@prisma/client`, `@prisma/adapter-libsql`, `@libsql/client`
  - `zod`, `react-hook-form`, `@hookform/resolvers`
  - `sonner`, `recharts` (through shadcn `chart`)
  - `tsx` (runs the seed)
  - `vitest`, `@playwright/test`
- **Zero-setup scripts:**
  - `src/lib/db.ts` is a Prisma singleton that falls back to `file:./dev.db` when `DATABASE_URL` is unset.
  - `postinstall`: `prisma generate`.
  - `predev`: `prisma migrate deploy` plus a seed step that only runs when the table is empty.
- Scripts: `typecheck` (`tsc --noEmit`), `test`, `test:e2e`, `db:reset`.
- `.env.example`. Add `*.db` and `.env*` to `.gitignore`.
- **GitHub Actions CI** (`.github/workflows/ci.yml`): lint, typecheck, unit tests, build and Playwright. This shows the quality is enforced, and it works because SQLite needs no services.

## Phase 2: Data layer
- `prisma/schema.prisma`: the `Request` model and the `Category`, `Priority` and `Status` enums from requirements.md. Indexes on `createdAt`, `status`, `category` and `priority`. Run `migrate dev --name init`.
- `prisma/seed.ts`: about 30 realistic, varied requests ("VPN drops every hour on Wi-Fi", "Update emergency contact", …) spread across every enum, with dates over the last 45 days and `updatedAt` after `createdAt`.
- `src/lib/constants.ts`: the single source for labels, badge styles and priority sort weight for each enum value.
- `src/lib/validation.ts`:
  - `requestCreateSchema` and `requestUpdateSchema` (partial, so status-only changes work).
  - `requestQuerySchema`: q, category, status, priority and sort, parsed tolerantly so bad URL values fall back to defaults instead of crashing.
- `src/lib/services/requests.ts`:
  - `listRequests(query)`: an AND of search on title or description plus the enum filters. Sorts by newest, oldest or priority, with priority sorted through its weight.
  - `getRequest`, `createRequest`, `updateRequest`, `deleteRequest`.
  - `getStats()`: `groupBy` on status, category and priority. Zero-fills enum values that have no rows.
- **Integration tests** (`tests/unit/services.test.ts`) run against a temporary SQLite file: filters combine, search hits both fields, sorting works, stats are zero-filled.

## Phase 3: API layer
- `api/requests/route.ts` (GET with query, POST) and `api/requests/[id]/route.ts` (GET, PATCH, DELETE).
- `src/lib/api-errors.ts` holds one helper: `ZodError` → 400 `{ error, details: fieldErrors }`, Prisma `P2025` or missing → 404, invalid JSON → 400, anything else → 500 with a generic message.
- **Route tests** call the exported handlers with `Request` objects: 201 on valid input, 400 on bad input, 404 on a missing id, and a PATCH that changes status only.

## Phase 4: Visual direction and layout shell
- Use the **frontend-design** skill to pick a calm, professional and distinctive look rather than generic shadcn defaults:
  - one accent color, a typographic scale, consistent spacing tokens
  - a status and priority color system that also carries text and icons, never color alone
- `layout.tsx`: header with nav (Dashboard, Requests), the primary "New request" button, `Toaster`, and a mobile menu.
- `error.tsx`, `not-found.tsx` and `loading.tsx` patterns shared across pages.

## Phase 5: Requests list. Covers R2, R5, R6
- `requests/page.tsx` (Server Component): `searchParams` → `requestQuerySchema` → `listRequests`. Shows a result count ("12 requests").
- `RequestFilters` (client): search debounced at 300 ms, three Selects, a sort Select and a "Clear filters" button that only appears when a filter is active. Changes are written with `router.replace`, so the URL is shareable and survives refresh.
- `RequestTable` on desktop and `RequestCard` list below `md`. Shows title with a clamped description preview, category, `PriorityBadge`, `StatusSelect` and a relative time with the exact date in a tooltip (`Intl.RelativeTimeFormat`, no extra dependency).
- `StatusSelect`: inline PATCH, disabled while pending, toast, `router.refresh()`. On failure it rolls back and shows an error toast.
- `DeleteRequestButton`: an AlertDialog that names the request being deleted, then a toast and a refresh.
- States: skeleton `loading.tsx`, an empty state with a call to action, and a "No results" state that offers to clear filters.
- Edge cases: very long titles (truncation plus `title` attribute), and keyboard access to every control.

## Phase 6: Create and edit. Covers R1, R3
- `RequestForm`: React Hook Form with `zodResolver` using the same schema as the server. Errors appear under each field, there is a live character counter on title and description, and the submit button is disabled while saving. Server `details` are mapped back to the matching fields. If the user tries to leave with unsaved changes on edit, they get a warning.
- `requests/new`: POST, then toast and redirect to the list.
- `requests/[id]/edit`: pre-filled form, status editable here as well, then PATCH. Calls `notFound()` when the id doesn't exist.

## Phase 7: Dashboard. Covers R7
- `app/page.tsx` must always be dynamic. Confirm the Next 16 mechanism (`connection()` or the equivalent) with context7.
- `StatCard` ×4: Total, New, In Progress, Completed. Each one links to the list already filtered by that status.
- `CategoryChart` and `PriorityChart` (shadcn chart): bars are clickable and open the filtered list. Includes an empty state.
- A "Recent requests" panel showing the latest 5.

## Phase 8: End-to-end tests and a full review
- Playwright specs (written with the webapp-testing skill) under `tests/e2e/`:
  - create → validation errors → success → appears in the list
  - edit, and the 404 for a missing id
  - status change persists after reload
  - delete with confirmation
  - search, filters and sort combine and survive reload
  - dashboard counts update
  - the 375px viewport
- A full manual pass with Playwright MCP over every acceptance check in R1–R8.
- An accessibility pass: labels, focus order, contrast (design:accessibility-review skill).

## Phase 9: Deploy
- The user creates a Turso database and a Vercel project linked to GitHub. I provide the exact commands.
- Apply `prisma/migrations/*/migration.sql` to Turso, seed it with the Turso environment variables, and set `DATABASE_URL` and `DATABASE_AUTH_TOKEN` in Vercel.
- Smoke-test the live URL with Playwright MCP at desktop width and at 375px.

## Phase 10: Extras (only after Phases 1–9 are solid, in this order)
1. Dark mode (shadcn theme toggle; check the charts in both themes).
2. CSV export of the current filtered list (`GET /api/requests/export?…`).
3. Arabic/English with RTL. Only if there is clear time left.

## Phase 11: README and explainability
- README:
  - overview with screenshots
  - live link
  - 3-command quick start
  - technologies and AI tools (Claude Code, context7, shadcn, Playwright and next-devtools MCPs, the custom skills)
  - development approach
  - challenges (taken from `ai-log.md`)
  - limitations and future work (auth, pagination, audit history, attachments)
- `docs/architecture.md`: a data-flow diagram and a "where to change X" map for the live-modification part of the interview.
- Rehearse live changes: confirm the `add-request-field` skill matches the real files by dry-running it, e.g. adding an optional `department` field on a throwaway branch.

---

## Critical files
`prisma/schema.prisma`, `prisma/seed.ts`, `src/lib/{db,validation,constants,api-errors}.ts`, `src/lib/services/requests.ts`, `src/app/api/requests/**`, `src/app/{layout,page}.tsx`, `src/app/requests/**`, `src/components/{requests,dashboard,layout}/**`, `tests/{unit,e2e}/**`, `.github/workflows/ci.yml`, `package.json`, `README.md`, `docs/*`.

## Verification
- `npm run lint`, `npm run typecheck`, `npm test` and `npx playwright test` pass locally and in CI.
- **Fresh-clone test:** clone into a temp folder with no `.env`, run `npm install` then `npm run dev`. The app should open seeded with data.
- **Client validation bypassed:** curl POST/PATCH with bad data should return 400 with details. PATCH or DELETE on a missing id should return 404.
- **Persistence:** create a request, refresh, restart the server, and check it is still there. Repeat on the live URL from a second device or browser.
- Every R1–R8 acceptance check passes at desktop and 375px with no console errors (Playwright MCP and next-devtools MCP).
