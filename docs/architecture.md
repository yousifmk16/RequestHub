# Architecture

## The two paths

**Reading** (list, dashboard, detail and edit pages): server components, no client fetch.
```
page.tsx ─► connection()  (read at request time, D4)
         ─► parseRequestQuery(searchParams)   src/lib/validation.ts  (tolerant)
         ─► listRequests / getRequest / loadRequestStats   src/lib/services, src/lib/data
         ─► Prisma ─► libSQL adapter ─► SQLite file (dev) / Turso (prod)
         ─► HTML streamed inside <Suspense> behind a same-shape skeleton
```

**Writing** (create, edit, status, delete): every change goes through the API.
```
RequestForm / StatusSelect / DeleteRequestButton   (client)
   ─► apiRequest()               src/lib/api-client.ts  (all failures → readable message)
   ─► /api/requests[/:id]        src/app/api/requests/**
   ─► Zod schema                 src/lib/validation.ts  (the same one the form uses)
   ─► service                    src/lib/services/requests.ts  (only code using Prisma)
   ─► Prisma ─► database
   ◄─ JSON  { …request }  or  { error, details: { fieldErrors } }  with 400 / 404 / 500
   ─► toast + router.refresh()   (re-renders the page and the header's workload logo)
```

Rules that keep it simple:
- Only `src/lib/services/` imports Prisma. Routes and pages never do.
- One Zod schema module for client and server. Form field names equal the
  API's `fieldErrors` keys, so server errors land under the right input.
- Filters, search and sort live in the URL, never in client state.

## Where things are

```
prisma/
  schema.prisma          Request model + Category / Priority / Status enums
  migrations/            SQL migrations (applied locally by `npm run dev`)
  seed.ts, seed-data.ts  30 demo requests; seeds only an empty table
src/app/
  layout.tsx             Header, skip link, toaster
  page.tsx               Dashboard
  requests/page.tsx      List + filters
  requests/new/          Create form
  requests/[id]/         Read-only detail page + the request not-found page
                         (shared with edit/ below it)
  requests/[id]/edit/    Edit form
  api/requests/**        REST handlers (GET/POST, GET/PATCH/DELETE)
  api/health/            Database health check (D14)
src/lib/
  validation.ts          Zod schemas: create, update, form, URL query
  constants.ts           Labels, hints, ordering, priority weights, limits
  services/requests.ts   All database access
  data/request-stats.ts  Cached, request-time stats for logo/hero/dashboard
  api.ts                 Error responses + withErrorHandling for routes
  api-client.ts          Browser-side fetch wrapper
  db.ts, database-config.ts   Prisma client; where the database lives
  request-query-url.ts   Query ⇄ /requests URL
  workload.ts            The logo's "completed share → lit bars" rule
  format.ts              Relative time, percentages
src/components/
  layout/                Header, nav, page container
  brand/                 The workload logo
  requests/              List, detail view, filters, chips, status select, delete, badges
  requests/form/         RequestForm and its building blocks
  dashboard/             Hero, stat cards, breakdown bars, latest requests
  ui/                    shadcn components (generated)
tests/unit/              Vitest: rules, service and routes on a real SQLite file
tests/e2e/               Playwright: R1–R8, axe, keyboard, reflow
scripts/                 Test DB prep, Turso migrations/setup, screenshots
```

## Where to change what

| Change | Files |
|---|---|
| **Add a field to Request** | Follow `.claude/skills/add-request-field/SKILL.md`: schema → migration → validation → constants → service → form → list → filters → seed → tests |
| A validation rule (e.g. title length) | `TITLE_LENGTH` / `DESCRIPTION_LENGTH` in `constants.ts`; messages in `validation.ts`. The client and server both change |
| Add a status, department or priority value | `enum` in `schema.prisma` + migration; label, hint (and weight for priority) in `constants.ts`; colour/icon in `components/requests/styles.ts`; colour token in `globals.css` |
| A label or wording | `constants.ts` (labels, hints), the component for UI copy |
| Colours, fonts, spacing | Tokens in `src/app/globals.css` (see design.md). Run `npm run dev:clean` after editing |
| A new filter | `requestQuerySchema` (validation), `listRequests` where-clause (service), `buildRequestsHref` (URL), `RequestFilters` (UI) |
| A new sort order | `SORT_OPTIONS` + `SORT_LABELS` (constants), `listRequests` (service) |
| What the detail page shows | `components/requests/RequestDetail.tsx` (+ `RequestDetailSkeleton.tsx` to keep the same shape); the page itself is `app/requests/[id]/page.tsx` |
| The "request doesn't exist" screen | `app/requests/[id]/not-found.tsx` (detail and edit pages both use it) |
| A dashboard number or breakdown | `getRequestStats` (service) → `StatCards` / `Breakdowns` |
| A new API endpoint | `src/app/api/...`; validate with a schema from `validation.ts`, call a service function, wrap with `withErrorHandling` |
| Demo data | `prisma/seed-data.ts` (tests check every row passes validation), then `npm run db:seed` |
| Database location | `database-config.ts` (local default), `DATABASE_URL` / `DATABASE_AUTH_TOKEN` in production |
| Schema change in production | `npm run db:migrate -- --name …` locally, then `npm run db:deploy` against Turso before pushing (deployment.md) |
