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

## Template

### D1 — <decision title>
- **Context:** what needed deciding
- **Options:** A / B / C
- **Choice:** which one
- **Why:** reasoning and trade-offs
