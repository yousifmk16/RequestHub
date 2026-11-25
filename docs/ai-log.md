# AI Usage Log

Notable moments from building with AI tools. Feeds the README sections
"Technologies and AI tools used" and "Challenges encountered".

Add an entry when the AI got something wrong, needed correcting, or a tool
(MCP/skill) caught a real problem.

| Date | Task | What the AI did / got wrong | How it was caught | Fix |
|------|------|-----------------------------|-------------------|-----|
| 2026-11-25 | Plan: database | First plan kept PostgreSQL/Neon, so a fresh clone could not run without a DB account. | Reviewing the plan against the "anyone can open it with no dependencies" goal. | Switched to SQLite locally + Turso in production (D1). |
| 2026-11-25 | Install Prisma | `npm install prisma` would have pulled `8.0.0-rc.35`: the CLI's `latest` npm tag points to a release candidate while `@prisma/client` latest is 7.10.1, a major-version mismatch. | Checked `npm view prisma dist-tags` before installing. | Pinned all Prisma packages to exact 7.10.1. |
| 2026-11-25 | Prisma libsql adapter | Docs research returned the class name `PrismaLibSQL`. The installed 7.10.1 package exports `PrismaLibSql`. | Read the package's own `.d.ts` instead of trusting the summary. | Used `PrismaLibSql`. Rule: installed types beat docs summaries. |
| 2026-11-25 | Add Vitest | Install failed: the scaffold pinned `@types/node@^20`, while Vitest 5 needs Node 22+ types. | npm ERESOLVE peer-dependency error. | Fixed the root cause (target Node 24 LTS types, `engines >=22`) instead of `--legacy-peer-deps`. |
| 2026-11-25 | E2E database | Used `prisma migrate reset --force` to reset the test DB. Prisma 7 detected an AI agent and refused without explicit user consent. | Playwright webServer failed with Prisma's AI-safety message. | Did not bypass the guard. Redesigned: a script deletes the throwaway `e2e.db` and runs `migrate deploy`, which is simpler and deterministic. |
