/**
 * Turns a database error into a safe, actionable category for /api/health.
 * Only the category and a fixed hint are ever returned: never the URL, the
 * token or the raw error text, so the endpoint can stay public.
 */
export type DatabaseProblem = "schema-missing" | "auth-failed" | "unreachable" | "unknown";

const HINTS: Record<DatabaseProblem, string> = {
  "schema-missing": "The database has no tables yet. Run `npm run db:deploy` against it (docs/deployment.md).",
  "auth-failed": "The database rejected the token. Check DATABASE_AUTH_TOKEN, then redeploy.",
  unreachable: "The database URL can't be reached. Check DATABASE_URL (it must start with libsql://), then redeploy.",
  unknown: "Unexpected database error. See the server logs.",
};

export function classifyDatabaseError(error: unknown): DatabaseProblem {
  // Driver adapters wrap errors, so look through the cause chain as well.
  const text = collectMessages(error).toLowerCase();
  if (text.includes("no such table")) return "schema-missing";
  if (/\b401\b|unauthori[sz]ed|\bjwt\b|auth token|authentication/.test(text)) return "auth-failed";
  // Turso answers a wrong database URL with HTTP 404 ("database not found").
  if (/status 404|enotfound|getaddrinfo|fetch failed|econnrefused|url_invalid|url_scheme|invalid url/.test(text)) {
    return "unreachable";
  }
  return "unknown";
}

export function databaseHint(problem: DatabaseProblem): string {
  return HINTS[problem];
}

function collectMessages(error: unknown, depth = 0): string {
  if (!(error instanceof Error) || depth > 5) return String(error ?? "");
  const code = "code" in error ? ` ${String(error.code)}` : "";
  return `${error.message}${code} ${collectMessages(error.cause, depth + 1)}`;
}
