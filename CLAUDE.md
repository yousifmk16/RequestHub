# Request Hub — Project Instructions

Employee Request Management System: employees submit, manage and track internal
service requests. Built for a technical assessment — quality, reliability and
explainability matter more than feature count.

**Before starting any task, read `docs/priorities.md` and follow its priority order.**
Requirements live in `docs/requirements.md`. The build plan lives in `docs/plan.md`.

## Stack
- Next.js 16 (App Router) + TypeScript (strict)
- Tailwind CSS + shadcn/ui (add components via the shadcn MCP)
- Prisma ORM + SQLite via `@prisma/adapter-libsql`
  (local file `dev.db`, auto-created + seeded; Turso in production — see docs/decisions.md D1)
- Zod (validation) + React Hook Form
- Recharts (dashboard charts), Sonner (toasts)
- Vitest (unit tests), Playwright (e2e tests)
- Deployed on Vercel

## Folder structure
```
src/
  app/
    page.tsx                  → dashboard
    requests/page.tsx         → list + search + filters
    requests/new/page.tsx     → create form
    requests/[id]/edit/       → edit form
    api/requests/             → REST route handlers (GET, POST)
    api/requests/[id]/        → REST route handlers (GET, PATCH, DELETE)
  lib/
    db.ts                     → Prisma client (single instance)
    validation.ts             → Zod schemas (shared by client + server)
    services/requests.ts      → ALL database logic
    constants.ts              → labels/colors for categories, priorities, statuses
  components/
    ui/                       → shadcn components (generated, don't hand-edit)
    requests/                 → RequestForm, RequestTable, Filters, StatusBadge...
    dashboard/                → StatCard, charts
prisma/
  schema.prisma
  seed.ts
tests/
  unit/                       → Vitest
  e2e/                        → Playwright
docs/                         → requirements, priorities, plan, decisions, ai-log
```

## Architecture rules
- Data flow: UI → API route → Zod validation → service → Prisma → DB.
- Only `src/lib/services/` talks to Prisma. Routes and pages never import Prisma directly.
- Server Components may read data by calling the service directly.
- Every mutation goes through an API route that validates with Zod.
- One Zod schema per entity in `src/lib/validation.ts`, used on client AND server.
- API errors return JSON `{ error: string, details?: ... }` with correct status
  codes: 400 validation, 404 not found, 500 unexpected.
- Filters and search live in URL search params so they survive refresh.

## Code style
- TypeScript strict. No `any`. No `@ts-ignore`.
- Small, single-purpose components; keep files under ~200 lines.
- Clear, full names. Comments explain WHY, not what.
- No new dependency without stating the reason first.
- No leftover `console.log` or dead code.

## Tools — use them
- **context7**: check current docs before writing code against any library.
- **shadcn MCP**: add UI components.
- **next-devtools MCP**: check for build/runtime errors while `npm run dev` runs.
- **Playwright MCP**: verify every flow in the browser (desktop + 375px).
- **webapp-testing skill**: write repeatable e2e tests.
- **add-request-field skill**: whenever a field is added to Request.
- **pre-submit-review skill**: before every commit.

## Commands
- `npm run dev` — start dev server
- `npm run lint` — lint
- `npm test` — unit tests
- `npx playwright test` — e2e tests
- `npx prisma migrate dev --name <name>` — create/apply migration
- `npx prisma db seed` — seed data

## Working rules
- Work on one step of `docs/plan.md` at a time. Don't jump ahead.
- Before building, state the approach in 2–3 lines.
- Record real trade-offs in `docs/decisions.md`.
- Record AI mistakes and how they were caught in `docs/ai-log.md`.
- After each task, summarize: files changed + how the data flows.
- Never commit `.env` files or secrets.

## Definition of done
- Meets the requirement in `docs/requirements.md`
- `npm run lint` and `npm test` pass
- Checked in the browser at desktop and 375px, no console errors
- Loading, empty and error states handled
