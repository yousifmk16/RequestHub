import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET as HEALTH } from "@/app/api/health/route";
import { db } from "@/lib/db";
import * as service from "@/lib/services/requests";

// connection() needs a Next.js request scope, which a direct handler call
// doesn't have. That it makes the route request-time is covered end to end
// in tests/e2e/health.spec.ts, against a production build.
vi.mock("next/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/server")>()),
  connection: async () => {},
}));

beforeEach(async () => {
  await db.request.deleteMany();
  vi.restoreAllMocks();
});

describe("GET /api/health", () => {
  it("reports ok with the request count when the database works", async () => {
    await service.createRequest({
      title: "Broken keyboard",
      description: "Several keys stopped working after a coffee spill.",
      category: "IT",
      priority: "MEDIUM",
    });
    const response = await HEALTH();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ok", database: "local-file", requests: 1 });
  });

  it("reports a safe category (no raw error) when the database fails", async () => {
    vi.spyOn(service, "countRequests").mockRejectedValue(new Error("SQLITE_ERROR: no such table: Request"));
    vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await HEALTH();
    const body = await response.json();
    expect(response.status).toBe(503);
    expect(body).toMatchObject({ status: "error", problem: "schema-missing" });
    expect(JSON.stringify(body)).not.toContain("SQLITE_ERROR");
  });
});
