import { connection } from "next/server";
import { classifyDatabaseError, databaseHint } from "@/lib/database-health";
import { countRequests } from "@/lib/services/requests";

// GET /api/health: is the database reachable, authorised and migrated?
// Safe to expose: it reports a category and a fixed hint, never secrets.
export async function GET() {
  // A GET handler that never touches the request is prerendered like a page,
  // and a local SQLite count finishes inside that window: the build's answer
  // was then served for a year. connection() makes every check a live one
  // (docs/decisions.md D4, D14). It stays outside the try: it signals Next by
  // throwing during prerendering.
  await connection();

  const usingTurso = (process.env.DATABASE_URL ?? "").startsWith("libsql://");
  try {
    const requests = await countRequests();
    return Response.json({ status: "ok", database: usingTurso ? "turso" : "local-file", requests });
  } catch (error) {
    console.error("Health check failed", error);
    const problem = classifyDatabaseError(error);
    return Response.json(
      { status: "error", database: usingTurso ? "turso" : "local-file", problem, hint: databaseHint(problem) },
      { status: 503 },
    );
  }
}
