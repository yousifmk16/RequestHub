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
  const url = process.env.DATABASE_URL;

  // On Vercel the local-file fallback can't work (read-only disk, no
  // migrations), so a missing variable fails loudly with the fix, instead of
  // as a confusing "unable to open database file" at the first request.
  if (!url && process.env.VERCEL) {
    throw new Error(
      "DATABASE_URL is not set. Add the Turso URL and DATABASE_AUTH_TOKEN in Vercel → " +
        "Project Settings → Environment Variables (see docs/deployment.md).",
    );
  }

  return {
    url: url || DEFAULT_DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
  };
}
