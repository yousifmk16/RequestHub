import { execSync } from "node:child_process";

// Runs once before all unit tests: fresh, migrated SQLite file for service tests.
export default function setup() {
  execSync("node scripts/prepare-test-db.mjs prisma/test.db", { stdio: "ignore" });
}
