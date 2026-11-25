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

## Template

### D1 — <decision title>
- **Context:** what needed deciding
- **Options:** A / B / C
- **Choice:** which one
- **Why:** reasoning and trade-offs
