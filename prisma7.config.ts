import { existsSync } from "node:fs";
import { defineConfig } from "prisma/config";
import { getDatabaseConfig } from "./src/lib/database-config";

// Prisma's CLI doesn't read .env by itself. Load it only if present, so the
// zero-setup path (no .env at all) keeps working without a dotenv dependency.
if (existsSync(".env")) process.loadEnvFile(".env");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: getDatabaseConfig().url,
  },
});
