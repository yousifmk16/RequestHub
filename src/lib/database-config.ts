/**
 * Single source of truth for where the database lives, shared by the app
 * (src/lib/db.ts) and the Prisma CLI (prisma7.config.ts) so they can never
 * point at different files.
 *
 * With no environment variables set, a local SQLite file is used, so a fresh
 * clone runs with zero setup. In production, DATABASE_URL is a libsql:// Turso
 * URL and DATABASE_AUTH_TOKEN is its token.
 */
export const DEFAULT_DATABASE_URL = "file:./prisma/dev.db";

export type DatabaseConfig = {
  url: string;
  authToken?: string;
};

export function getDatabaseConfig(): DatabaseConfig {
  return {
    url: process.env.DATABASE_URL || DEFAULT_DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
  };
}
