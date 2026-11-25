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
- **Why:** Data is always fresh with no invalidation logic to get wrong. The
  static shell (layout, nav) is still prerendered, so pages load fast. B would
  add cache tags and `revalidateTag` calls on every write for no real benefit
  at this data size.
- **Correction (found while building the live logo):** the original reasoning
  said database reads opt out of prerendering automatically. That holds for
  the API routes (they read `request.url` or `params`), but **not for pages**.
  Local SQLite answers within the prerender window, so a production build
  baked the counts into static HTML, cached for a year. A production check
  caught it: completing a request changed the API data but not the page.
  - **Rule:** every server component that reads the database calls
    `await connection()` (from `next/server`) before the query. The bundled
    Next docs recommend exactly this for fast/synchronous SQLite drivers.
  - **Result:** pages build as `◐` (partial prerender, static shell plus
    streamed data) and respond with `Cache-Control: no-store`.
  - **Caveat:** `connection()` must sit outside any `try/catch`, because it
    signals Next by throwing during prerendering.
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
  - Layout and the routing-tab concept are unchanged.

### D7 — Typeface: Almarai
- **Context:** With the Lakeora palette in place, the product owner chose to
  match Lakeora's typeface as well (it replaces Public Sans).
- **Why it fits:** It is the brand's font, and it covers Arabic, which the
  planned Arabic/RTL extra needs.
- **Trade-offs:**
  - Almarai has no 500/600 weights. Rather than editing the generated shadcn
    components, the theme maps `--font-weight-medium` and
    `--font-weight-semibold` to 700: one token instead of browser
    guesswork (500 would silently render as 400).
  - Only the Latin subset is preloaded, so English pages don't pay for the
    Arabic font files.

### D8 — White header, dashboard hero, page-level containers
- **Context:** The product owner asked for a white header like lakeora.ai, a
  navy hero band on the dashboard, and a logo whose bars rise left to right.
- **Choice:**
  - The header is white and sticky, with navy links and a red active underline.
  - The dashboard opens with a full-width navy band.
  - The centred content column moved from the root layout into a
    `PageContainer` used by each page.
- **Why:** A full-width band can't live inside a centred, padded `<main>`. The
  usual workaround (`w-screen` or negative margins) causes horizontal
  scrolling on Windows, where `100vw` includes the scrollbar. Letting each page
  choose its container is simpler and has no overflow (checked: no horizontal
  scroll at 1280px or 375px).
- **Motion:** The hero's rising bars grow once on load. It is the app's only
  non-interactive animation, it reinforces the logo, and it is disabled under
  `prefers-reduced-motion`.

### D9 — The logo is a live workload meter
- **Context:** The product owner wanted the logo to be interactive: all grey
  when many requests are open, full colour when none are, with four bars in
  the style of Lakeora's mark and palette, and a navy header.
- **Rule:** lit bars = `floor(completed / total × 4)`. No requests counts as
  everything done (all lit). Bars light from the bottom (longest, red) up.
  The product owner chose a share-based rule over fixed counts, so it reads
  the same with 10 or 10,000 requests. The rule is a pure function in
  `src/lib/workload.ts` with unit tests.
- **Shape:** four pills lengthening top to bottom with white end dots, in
  Lakeora's red ramp (`--lakeora-pink`, `--red-60`, `--lakeora-coral`,
  `--lakeora-red`). Lakeora's mark has three bars; four keeps ours its own.
- **How it stays live:** the header logo is an async server component reading
  `getRequestStats()`. Every mutation in the UI calls `router.refresh()`,
  which re-renders the layout, so the bars update right after a status change.
- **Resilience:** the logo sits in `<Suspense>` with the full-colour mark as
  fallback, and a failed read also falls back to it, so it can never break the
  header. Its meaning is in the tooltip and accessible name ("14 of 30
  requests completed, 16 open"). The dashboard hero shows the same meter
  large, with that sentence as a caption.

### D10 — Requests list: one responsive list, URL-driven filters
- **Layout:** One `<ul>` where each row is a CSS grid. It shows as columns from
  `md` up and as stacked blocks below. The alternative, a `<table>` plus a
  separate mobile card list, renders every request twice, so each status
  control and delete button would exist twice (double the DOM, ambiguous for
  tests and assistive tech). A visual column header row (`aria-hidden`) labels
  the desktop columns, and every cell carries words (department, "High",
  "In Progress"), so nothing relies on the header or on colour.
- **Filters:** The URL is the only source of truth (`?q=&category=&status=&
  priority=&sort=`), parsed by the tolerant `requestQuerySchema`, so links are
  shareable and survive refresh.
  - Selects use React 19 `useOptimistic`, so the choice shows instantly while
    the server re-renders.
  - Search is local state pushed after 300 ms. A "last pushed value" guard
    stops a slow response from overwriting newer typing, while still adopting
    outside changes (the empty state's Clear filters link, back/forward).
  - While a new list loads, the filters mark themselves `data-pending` and the
    list dims via `group-has-data-pending` (CSS only, no shared context).
- **Status chips (replaced the Status dropdown):** "All · New · In Progress ·
  Completed", each with a count, above the list. Having both chips and a status
  dropdown would have meant two controls for one filter, so the dropdown went.
  - **Counts:** they follow the other filters (search, department, priority)
    but ignore status, so they stay put while switching chips and say where the
    matching work stands.
  - **One query:** the page runs a single query without the status filter,
    counts it, then narrows to the chosen status in memory, so counts and list
    can never disagree.
  - **Accessible name:** each chip is named "In Progress, 7 requests" rather
    than the visual "In Progress7".
- **Inline status:** Local state that re-syncs when the server value changes,
  not `useOptimistic`. An optimistic value would snap back between the PATCH
  finishing and `router.refresh()` landing, causing a flicker. On failure it
  rolls back with an error toast.
- **Delete:** A controlled AlertDialog that stays open (button disabled) until
  the server answers, so failures are visible. A 404 counts as success,
  because someone else already deleted it. Initial focus is on
  "Keep request", the safe choice.

## Template

### D1 — <decision title>
- **Context:** what needed deciding
- **Options:** A / B / C
- **Choice:** which one
- **Why:** reasoning and trade-offs
