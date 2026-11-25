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

### D11 — Create/edit form
- **One form, one schema.** `RequestForm` handles both modes. It validates with
  `requestFormSchema`, which is the create rules plus an optional status, so
  there's no casting between two resolver types. On edit, status is a radio
  group that starts on the current value and can't be cleared. The API
  re-validates everything anyway (create ignores status, PATCH checks it).
- **Native radios as cards** for department, priority and status, instead of
  a select or a custom listbox. Arrow keys, focus, `fieldset`/`legend`
  grouping and screen-reader naming all come from the platform. The cards
  reuse the list's visuals (routing tab, signal bars, status icon) plus a
  one-line hint ("Laptops, access, software, network").
- **Errors.** Client errors appear when a field is left (`mode: "onTouched"`)
  and on submit, which also focuses the first invalid field. Server `400`
  field errors are mapped onto the same fields with `setError`, so a request
  that bypassed the client still shows messages in the right place. A blank
  field says "required" once (Zod `abort`) instead of "too short", and the
  message says "department" to match the UI's word for category.
- **Unsaved changes:** `beforeunload` covers closing or reloading the tab.
  Every in-app link (header, logo, back link, Cancel) asks before discarding.
  The App Router has no blocking API, so a document-level click listener in
  the capture phase runs before Next's `<Link>` and cancels the click if the
  user declines. The browser's back/forward buttons aren't covered.
- **Missing request → 404 page, but HTTP 200.** With Cache Components, the
  prerendered shell starts the response with `200`, and `notFound()` inside
  the page runs after that, so the status can't change. Even
  `instant = false` doesn't help, per the bundled Next docs. Next adds
  `<meta name="robots" content="noindex">` to these pages. A true `404` status
  would need a database lookup in `proxy.ts` on every edit URL. That's a
  second data path for a status code no user sees, so it wasn't added. R3
  ("shows a 404 page") is met, and the API returns real 404s.
- **Tried later, on a production build, and reverted:**
  - A `proxy.ts` that checks the id and calls `NextResponse.rewrite(url, { status: 404 })`:
    the rewrite ignores `status`, and the response stayed 200.
  - Rewriting to a page that always calls `notFound()`: still 200. That page
    is a partial prerender too, because the shared layout holds the live
    header logo (request-time data), so every page streams its shell first.
  - The only remaining option was for the proxy to fetch the not-found HTML
    and re-send it with a 404: a self-request per miss, with loop and cost
    risks, for a status code no user sees. Not worth it.

### D12 — Dashboard charts as HTML bars, not Recharts
- **Context:** R7 asks for breakdowns by department and by priority. The
  original stack listed Recharts, installed through the shadcn `chart`
  component.
- **Options:** A) Recharts (SVG, client-side) · B) server-rendered HTML/CSS bars.
- **Choice:** B. Recharts was installed, then removed before any chart was
  written.
- **Why:** Both charts are "category → count" lists. As HTML rows, each bar is
  a real link to the filtered list, so keyboard and screen-reader access comes
  free: the accessible name is "HR: 8 requests, 27% of all. Show these
  requests". They render on the server, so there's no client bundle, no
  hydration and no resize measuring at 375px. Recharts would need a hidden
  data table for accessibility and custom click handling, for two bar lists.
- **Details:** Bar width is relative to the largest row so differences stay
  readable, and the printed percentage is the share of all requests.
  Department bars use the routing-tab colours; priority uses grey / slate /
  alert red.
- **Revisit when:** charts need axes, time series or interaction (trends over
  time, stacked status per department). Then a chart library earns its keep.

### D13 — One stats query per page view
- **Context:** The header logo, the dashboard hero and the dashboard sections
  all need the same counts.
- **Choice:** `loadRequestStats()` wraps `getRequestStats()` in React `cache()`
  together with `connection()`. The query runs once per request whichever
  components ask, and the "read at request time" rule (D4) lives in one place.

### D14 — A public /api/health with safe diagnostics
- **Context:** On the first deploy every database read failed, and the API's
  generic 500 message (by design) hid the cause. Vercel's runtime logs were
  hard to reach.
- **Choice:** `GET /api/health` runs one count query and reports `ok` plus the
  request count, or `503` with one of `schema-missing`, `auth-failed`,
  `unreachable` or `unknown` and a fixed hint.
- **Why public:** it never returns the URL, the token or the raw error (the
  real cause is logged server-side), so it is safe to expose, and it doubles as
  an uptime check.
- **Verified against real errors**, not assumed ones (see ai-log).

### D15 — Dark mode
- **Choice:** `next-themes` (already a dependency of the shadcn toaster), class
  strategy, default = device setting, with a Light / Dark / Device setting menu.
  It applies the theme before first paint (no flash) and persists the choice.
- **Tokens, not overrides:** components use semantic tokens; only the
  `.dark` block changes values. Two roles were split out to make that work:
  `--selected` (navy vs near-white) and `--accent-text` (red text vs red
  surfaces).
- **Checked:** every dark pairing computed (testing.md), and the axe scan
  runs on every page and state in dark mode too.
- **Trade-off:** `suppressHydrationWarning` on `<html>`, because the theme
  class is set before React hydrates. The header icon (sun or moon) is chosen
  by CSS, so nothing else differs between the server and the client.

## Template

### D1 — <decision title>
- **Context:** what needed deciding
- **Options:** A / B / C
- **Choice:** which one
- **Why:** reasoning and trade-offs
