---
name: add-request-field
description: Use whenever a new field is added to the Request model (e.g. assignee, due date, location). Walks every layer in order so nothing is missed — schema, migration, validation, constants, service, form, edit page, detail page, list, filters, CSV export, dashboard, seed, tests and production.
---

# Add a field to Request

Before starting, confirm with the user:
- field name, type, required or optional, default value
- validation rules (and the error messages, in plain words)
- where it appears: form, detail page, list row, filters, CSV export, dashboard
  (the detail page and the CSV export show every field, so include them by
  default)

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
     destructuring and `initialValues`, or editing won't pre-fill it.
     `initialValues` is `Required<RequestFormValues>`, so an optional
     (nullable) column needs a fallback, e.g. `assignee: request.assignee ?? ""`

8. **Detail page** (`src/components/requests/RequestDetail.tsx`): add a
   `<Detail term="…">` to the `<dl>`, with a placeholder for an empty value
   (e.g. "Unassigned"). Keep `RequestDetailSkeleton.tsx` the same shape (one
   skeleton cell per `Detail`). Check 320px: the grid is two columns on
   phones, and a wide value may need `col-span-2 sm:col-span-1` like Status.

9. **List** (`src/components/requests/RequestList.tsx`), only if it belongs
   in the row: add a cell and a width to `COLUMNS` and the header row. Keep
   the stacked mobile layout and check 320px (`tests/e2e/reflow.spec.ts`).

10. **Filters** (if filterable): `toQueryString` and `hasActiveFilters`
    (`src/lib/request-query-url.ts`), and a control in `RequestFilters.tsx`
    that calls `navigate({ ...current, <field> })`. The list URL and the CSV
    export URL are both built by `toQueryString`, and the export route reuses
    `parseRequestQuery` + `listRequests`, so the export follows the new filter
    with no extra change.

11. **CSV export** (`src/lib/csv.ts`): add a column name to `REQUEST_COLUMNS`
    and the value to the row in `requestsToCsv`, in the same position. Use
    the UI label for enums (from `constants.ts`), `toISOString()` for dates
    and `?? ""` for empty values. `escapeCsvField` handles quoting and
    formula cells. Then update the expected header in `csv.test.ts`,
    `export-route.test.ts` and `tests/e2e/csv-export.spec.ts`.

12. **Dashboard** (only if asked): `StatCards` or a new `BreakdownBars` in
    `src/components/dashboard/`.

13. **Seed** (`prisma/seed-data.ts`): add realistic values to every row. The
    `seed-data` unit test fails if any row breaks validation. Then
    `npm run db:seed`.

14. **Tests**:
    - unit: `validation.test.ts` (rules, messages), `api-routes.test.ts`
      (400 with the field's message), `requests-service.test.ts` if it
      filters, `csv.test.ts` (the new column and its value)
    - e2e: `request-form.spec.ts` (fill and edit it), `request-detail.spec.ts`
      (it shows on the detail page). Update the defaults in
      `tests/e2e/helpers.ts` if the field is required.

15. **Verify**: `npm run lint`, `npm run typecheck`, `npm test`,
    `npm run test:e2e`; then in the browser at desktop and 375px: create and
    edit a request with the field, open its detail page, download the CSV,
    and check the console for errors.

16. **Production**: run `npm run db:deploy` against Turso **before** pushing
    (docs/deployment.md). Check `/api/health` after the deploy.

17. **Summarise**: the files changed, and how the field flows from form to
    database. Record any real trade-off in docs/decisions.md.
