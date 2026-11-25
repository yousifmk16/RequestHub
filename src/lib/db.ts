import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@/generated/prisma/client";
import { getDatabaseConfig } from "@/lib/database-config";

function createPrismaClient() {
  // The libsql adapter speaks to both a local `file:` SQLite database and a
  // remote Turso `libsql://` database, so dev and production share one driver.
  const adapter = new PrismaLibSql(getDatabaseConfig());
  return new PrismaClient({ adapter });
}

// Next.js dev reloads modules on every change; caching the client on
// globalThis stops each reload from opening a new database connection.
const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createPrismaClient>;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
