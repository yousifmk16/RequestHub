// Applies prisma/migrations to a remote libSQL database (Turso).
//
// `prisma migrate deploy` can't connect to a libsql:// URL, so this script
// runs each migration's SQL in order, inside a transaction with a row in a
// tracking table. Running it again skips migrations that are already applied.
//
//   DATABASE_URL="libsql://…" DATABASE_AUTH_TOKEN="…" npm run db:deploy
//
// Locally you don't need this: `npm run dev` applies migrations to the SQLite file.
import { createClient } from "@libsql/client";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const MIGRATIONS_DIR = "prisma/migrations";
const TRACKING_TABLE = "_request_hub_migrations";

if (existsSync(".env")) process.loadEnvFile(".env");

const url = process.env.DATABASE_URL;
const authToken = process.env.DATABASE_AUTH_TOKEN || undefined;

if (!url) fail('Set DATABASE_URL (the Turso "libsql://…" URL) and DATABASE_AUTH_TOKEN first.');
if (url.startsWith("file:") && !process.argv.includes("--allow-file")) {
  fail("This script is for the remote (Turso) database. Locally, `npm run dev` applies migrations.\n" +
    "Pass --allow-file to try it against a local file.");
}

const client = createClient({ url, authToken });

await client.execute(
  `CREATE TABLE IF NOT EXISTS "${TRACKING_TABLE}" ("name" TEXT PRIMARY KEY, "applied_at" TEXT NOT NULL)`,
);
const applied = new Set(
  (await client.execute(`SELECT "name" FROM "${TRACKING_TABLE}"`)).rows.map((row) => String(row.name)),
);

const migrations = readdirSync(MIGRATIONS_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort(); // folder names start with a timestamp, so this is the creation order

let appliedNow = 0;
for (const name of migrations) {
  if (applied.has(name)) {
    console.log(`  skip   ${name} (already applied)`);
    continue;
  }
  // Names go into the SQL text below, so only allow what Prisma generates.
  if (!/^[\w-]+$/.test(name)) fail(`Unexpected migration folder name: ${name}`);

  const sql = readFileSync(path.join(MIGRATIONS_DIR, name, "migration.sql"), "utf8");
  // One transaction per migration: a failure leaves neither half a schema
  // nor a tracking row behind.
  await client.executeMultiple(
    `BEGIN;\n${sql}\nINSERT INTO "${TRACKING_TABLE}" ("name", "applied_at") VALUES ('${name}', datetime('now'));\nCOMMIT;`,
  );
  console.log(`  apply  ${name}`);
  appliedNow += 1;
}

console.log(appliedNow === 0 ? "Database is up to date." : `Applied ${appliedNow} migration(s).`);
client.close();

function fail(message) {
  console.error(message);
  process.exit(1);
}
