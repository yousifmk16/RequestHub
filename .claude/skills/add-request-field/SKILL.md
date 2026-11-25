---
name: add-request-field
description: Use whenever a new field is added to the Request model (e.g. assignee, due date, location). Walks every layer in order so nothing is missed — schema, migration, validation, constants, service, form, edit page, list, filters, dashboard, seed, tests and production.
---

# Add a field to Request

Before starting, confirm with the user:
- field name, type, required or optional, default value
- validation rules (and the error messages, in plain words)
- where it appears: form, list row, filters, dashboard

Then state the plan in 2–3 lines and proceed. The data flow to keep in mind:
form → `/api/requests*` → Zod (`src/lib/validation.ts`) → service
(`src/lib/services/requests.ts`) → Prisma → database. See docs/architecture.md.

## Steps

1. **Schema**: add the field to `model Request` in `prisma/schema.prisma`.
   Optional → `?`. A new enum gets its own `enum` block. A new required field
   needs `@default(...)` so existing rows can migrate.

2. **Migration**: `npm run db:migrate -- --name add_<field>`, then
   `npx prisma generate` (Prisma 7's `migrate dev` no longer regenerates the
   client). Read the generated SQL.

3. **Validation** (`src/lib/validation.ts`):
   - add a field schema next to `title` / `description` (trimmed strings,
     `abort` on the "required" check, messages in the UI's words)
   - add it to `requestCreateSchema` **and** to the object inside
     `requestUpdateSchema` (it lists fields explicitly). `requestFormSchema`
     extends create, so it follows.
   - if filterable, add it to `requestQuerySchema` with `.optional().catch(undefined)`

4. **Constants** (`src/lib/constants.ts`): limits, and for an enum: labels,
   hints, ordering (and colours/icons in `src/components/requests/styles.ts`,
   tokens in `globals.css`, then `npm run dev:clean`).

5. **Service** (`src/lib/services/requests.ts`): create/update pass the
   validated input through, so usually no change. If filterable: the `where`
   in `listRequests`. If it's on the dashboard: `getRequestStats`.

6. **API routes**: normally no change. They use the schemas and the service.

7. **Form** (`src/components/requests/form/RequestForm.tsx`):
   - the input (or `OptionCards` for an enum, options in `form/options.tsx`),
     with a `<label>`, `FieldError`, and `aria-describedby`
   - **add the name to `FIELDS`**, or server-side errors for it won't show
     under the field
   - **edit page** `src/app/requests/[id]/edit/page.tsx`: add it to the
     destructuring and `initialValues`, or editing won't pre-fill it

8. **List** (`src/components/requests/RequestList.tsx`): add a cell and a
   width to `COLUMNS` and the header row. Keep the stacked mobile layout and
   check 320px (`tests/e2e/reflow.spec.ts`).

9. **Filters** (if filterable): `buildRequestsHref` and `hasActiveFilters`
   (`src/lib/request-query-url.ts`), and a `FilterSelect` in `RequestFilters.tsx`.

10. **Dashboard** (only if asked): `StatCards` or a new `BreakdownBars` in
    `src/components/dashboard/`.

11. **Seed** (`prisma/seed-data.ts`): add realistic values to every row. The
    `seed-data` unit test fails if any row breaks validation. Then
    `npm run db:seed`.

12. **Tests**:
    - unit: `validation.test.ts` (rules, messages), `api-routes.test.ts`
      (400 with the field's message), `requests-service.test.ts` if it filters
    - e2e: `request-form.spec.ts` (fill and edit it). Update the defaults in
      `tests/e2e/helpers.ts` if the field is required.

13. **Verify**: `npm run lint`, `npm run typecheck`, `npm test`,
    `npm run test:e2e`; then create and edit a request with the field in the
    browser at desktop and 375px, checking the console for errors.

14. **Production**: run `npm run db:deploy` against Turso **before** pushing
    (docs/deployment.md). Check `/api/health` after the deploy.

15. **Summarise**: the files changed, and how the field flows from form to
    database. Record any real trade-off in docs/decisions.md.
