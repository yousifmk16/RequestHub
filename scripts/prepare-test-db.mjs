// Gives a test run a brand-new database: delete the throwaway file, then apply
// migrations. Usage: node scripts/prepare-test-db.mjs prisma/<name>.db
// Refuses anything that isn't a test file, so it can never wipe dev or prod.
import { execSync } from "node:child_process";
import { rmSync } from "node:fs";

const TEST_DATABASE_FILES = ["prisma/e2e.db", "prisma/test.db"];
const file = process.argv[2];

if (!TEST_DATABASE_FILES.includes(file)) {
  console.error(`Refusing to reset "${file}". Allowed: ${TEST_DATABASE_FILES.join(", ")}`);
  process.exit(1);
}

rmSync(file, { force: true });
rmSync(`${file}-journal`, { force: true });

execSync("npx prisma migrate deploy", {
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: `file:./${file}` },
});
