# Decisions

Technical choices with real alternatives, and why each was made.
Feeds the README section "Development approach".

### D1 — Database: SQLite (local) + Turso (production) instead of PostgreSQL + Neon
- **Context:** Reviewers must be able to open the deployed link AND clone and run
  the project with zero setup. PostgreSQL needs a server or a hosted account plus
  a connection string, so a fresh clone would not run on its own.
- **Options:** A) Postgres + Neon for everything · B) Postgres in production +
  embedded Postgres (PGlite) locally · C) SQLite file locally + Turso (hosted
  SQLite/libSQL) in production.
- **Choice:** C, through Prisma's `@prisma/adapter-libsql`, which talks to both a
  `file:` URL and a `libsql://` URL. Same schema and same driver everywhere.
- **Why:** `npm install && npm run dev` works with no database, Docker or `.env`.
  Tests and CI need no database service. B adds an unusual adapter and two engines.
- **Trade-offs:** SQLite `contains` is case-insensitive only for ASCII letters
  (fine for this English-language data). `prisma migrate` can't target Turso
  directly, so production migrations are applied with the Turso CLI (documented in
  the README). Not suited to heavy concurrent writes, which this app doesn't have.

### D2 — Sorting by priority
- **Context:** SQLite stores Prisma enums as TEXT, so `ORDER BY priority`
  gives HIGH, LOW, MEDIUM (alphabetical), which is wrong.
- **Options:** A) raw SQL with `ORDER BY CASE priority …` · B) an extra
  `priorityRank` integer column kept in sync · C) sort the filtered rows in
  the service using `PRIORITY_WEIGHT` from constants.ts.
- **Choice:** C.
- **Why:** The list has no pagination, so every matching row is loaded anyway.
  An in-memory stable sort keeps the Prisma query type-safe, needs no extra
  column, and keeps newest-first order within each priority.
- **Trade-off:** If pagination is added, this must move into SQL (option A),
  because sorting one page in memory would be wrong. Recorded under future
  improvements.

### D3 — Literal search with SQLite LIKE
- **Context:** A service test showed that searching `%` returned every request.
  Prisma translates `contains` to `LIKE '%term%'` on SQLite without escaping
  `%` and `_`, and SQLite LIKE has no default escape character.
- **Options:** A) raw SQL with `LIKE … ESCAPE '\'` · B) `instr(lower(…))` raw
  SQL · C) keep the Prisma `contains` filter, then narrow the rows with an
  exact case-insensitive substring check.
- **Choice:** C.
- **Why:** A wildcard match is always a superset of the literal match, so the
  database still does the coarse filtering and the extra check only removes
  false positives. The query stays type-safe and combines cleanly with the
  other filters.
- **Trade-off:** Case-insensitivity stays ASCII-only, as with SQLite LIKE.

### D4 — Caching: keep Cache Components on, never cache request data
- **Context:** The Next.js 16 scaffold enables `cacheComponents`. Under this
  model, anything with no runtime or database access can be prerendered, and
  `use cache` opts data into caching. Requests change on every
  create/edit/delete, and R7 requires the dashboard to show current data.
- **Options:** A) turn Cache Components off · B) keep it and cache data with
  `use cache` plus invalidation after every mutation · C) keep it, cache no
  request data, and read the database at request time.
- **Choice:** C.
- **Why:** Database reads opt out of prerendering automatically (both API
  routes build as dynamic `ƒ`), so data is always fresh with no invalidation
  logic to get wrong. The static shell (layout, nav) is still prerendered, so
  pages load fast. B would add cache tags and `revalidateTag` calls on every
  write for no real benefit at this data size.
- **Consequence:** Pages that read data must render it inside `<Suspense>` or
  a `loading.tsx` boundary, which the UI needs for loading states anyway.

### D5 — API shape
- **Choice:** Plain REST. Resources are returned as-is (a list returns an
  array). Create returns `201` + `Location`, delete returns `204`. Errors are
  always `{ error, details? }`, where `details` is Zod's flattened
  `{ formErrors, fieldErrors }`.
- **Why:** Standard, easy to explain, easy to test with curl. `fieldErrors` keys
  match form field names, so the form shows server errors under the right input
  with no extra mapping.

### D6 — Adopt the Lakeora brand palette
- **Context:** After the first visual pass, the product owner asked for the
  colour palette of lakeora.ai.
- **Options:** A) eyeball colours from screenshots · B) read the site's
  published CSS custom properties and map them to semantic tokens.
- **Choice:** B. The site exposes named tokens (`--lakeora-navy`,
  `--lakeora-red`, slate/navy ramps), so every colour in the app traces back to
  a brand value. `globals.css` comments name the source token for each one.
- **Trade-offs:**
  - White on brand red `#E8372A` is 4.19:1, below WCAG AA. Red surfaces behind
    text use the brand's darker `#C72C21` (5.5:1). The bright red is kept for
    marks with no text.
  - Primary buttons are navy, not red. Red is the brand accent and the
    destructive colour, so making every button red would blur "main action"
    with "delete". Only the header's New request button uses red, as on
    lakeora.ai.
  - Layout, type (Public Sans) and the routing-tab concept are unchanged; only
    the palette moved.

## Template

### D1 — <decision title>
- **Context:** what needed deciding
- **Options:** A / B / C
- **Choice:** which one
- **Why:** reasoning and trade-offs
