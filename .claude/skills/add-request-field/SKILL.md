---
name: add-request-field
description: Use whenever a new field is added to the Request model (e.g. assignee, due date, department). Walks every layer in order so nothing is missed — schema, migration, validation, service, API, form, list, filters, seed and tests.
---

# Add a field to Request

Follow every step in order. Before starting, confirm with the user:
- field name, type, required or optional, default value
- validation rules
- whether it should appear in the list, filters and/or dashboard

Then state the plan in 2–3 lines and proceed.

## Steps

1. **Prisma schema** — add the field to `model Request` in `prisma/schema.prisma`.
   Optional fields use `?`. New enums get their own `enum` block.
   Existing rows: new required fields need a `@default(...)`.

2. **Migration** — `npx prisma migrate dev --name add_<field>`.
   Confirm the migration SQL looks right.

3. **Validation** — update the Zod schema in `src/lib/validation.ts`
   (create + update schemas). Use clear error messages.
   If it's an enum, add labels/colors to `src/lib/constants.ts`.

4. **Service** — update `src/lib/services/requests.ts`: create, update,
   and any search/filter logic if the field is filterable.

5. **API routes** — usually no change needed if they use the Zod schema and
   service. Verify that the field passes through end-to-end.

6. **Form** — add the input to `RequestForm` with label, error message and
   correct default value for edit mode.

7. **List / detail** — show the field in the table and mobile card view if
   required. Keep layout working at 375px.

8. **Filters** — if filterable, add to the Filters component and URL params.

9. **Dashboard** — only if requested.

10. **Seed** — update `prisma/seed.ts` with realistic values; reseed.

11. **Tests** — update unit tests for validation; update e2e create/edit flow.

12. **Verify** — `npm run lint`, `npm test`, then use Playwright MCP to create
    and edit a request with the new field at desktop and 375px.

13. **Summarize** — list files changed and how the field flows:
    form → API route → Zod → service → Prisma → DB.
