import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "src") },
  },
  test: {
    include: ["tests/unit/**/*.test.ts"],
    environment: "node",
    globalSetup: ["tests/unit/global-setup.ts"],
    // Service tests talk to a real SQLite file, never the dev database.
    env: { DATABASE_URL: "file:./prisma/test.db" },
    // Test files share that one database file, so run them one at a time.
    fileParallelism: false,
  },
});
