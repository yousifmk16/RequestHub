// Gives every E2E run a brand-new database: delete the throwaway test file,
// then apply migrations. Only ever touches prisma/e2e.db, never dev or prod.
import { execSync } from "node:child_process";
import { rmSync } from "node:fs";

const E2E_DATABASE_FILE = "prisma/e2e.db";

rmSync(E2E_DATABASE_FILE, { force: true });
rmSync(`${E2E_DATABASE_FILE}-journal`, { force: true });

execSync("npx prisma migrate deploy", {
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: `file:./${E2E_DATABASE_FILE}` },
});
