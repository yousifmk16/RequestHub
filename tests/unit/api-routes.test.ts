import { beforeEach, describe, expect, it, vi } from "vitest";
import { DELETE, GET as GET_ONE, PATCH } from "@/app/api/requests/[id]/route";
import { GET as LIST, POST } from "@/app/api/requests/route";
import { db } from "@/lib/db";
import * as service from "@/lib/services/requests";

/**
 * Calls the exported route handlers directly with real Request objects, against
 * the test database. This covers the server-side contract that the UI relies
 * on, including requests that bypass client-side validation.
 */

const BASE = "http://localhost/api/requests";

const validBody = {
  title: "Broken keyboard",
  description: "Several keys stopped working after a coffee spill.",
  category: "IT",
  priority: "MEDIUM",
};

function jsonRequest(method: string, url: string, body: unknown) {
  return new Request(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function context(id: string) {
  return { params: Promise.resolve({ id }) };
}

async function createViaApi(body: Record<string, unknown> = validBody) {
  const response = await POST(jsonRequest("POST", BASE, body));
  return (await response.json()) as { id: string; status: string; title: string };
}

beforeEach(async () => {
  await db.request.deleteMany();
  vi.restoreAllMocks();
});

describe("POST /api/requests", () => {
  it("creates a request: 201, Location header, status NEW, trimmed input", async () => {
    const response = await POST(jsonRequest("POST", BASE, { ...validBody, title: "  Broken keyboard " }));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(response.headers.get("Location")).toBe(`/api/requests/${body.id}`);
    expect(body).toMatchObject({ ...validBody, status: "NEW" });
  });

  it("rejects invalid input with 400 and per-field messages, and saves nothing", async () => {
    const response = await POST(jsonRequest("POST", BASE, { title: "a", category: "FINANCE" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Some fields are invalid. Please check and try again.");
    expect(body.details.fieldErrors).toMatchObject({
      title: ["Title must be at least 3 characters"],
      description: ["Description is required"],
      category: ["Choose a category"],
      priority: ["Choose a priority"],
    });
    expect(await db.request.count()).toBe(0);
  });

  it("rejects malformed JSON with 400, not 500", async () => {
    const response = await POST(jsonRequest("POST", BASE, "{not json"));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Request body must be valid JSON" });
  });

  it("ignores a status in the body: new requests always start as NEW", async () => {
    const created = await createViaApi({ ...validBody, status: "COMPLETED" });
    expect(created.status).toBe("NEW");
  });
});

describe("GET /api/requests", () => {
  it("returns the list, applying query-string filters", async () => {
    await createViaApi();
    await createViaApi({ ...validBody, title: "Payslip question", category: "HR" });

    const all = await (await LIST(new Request(BASE))).json();
    const hrOnly = await (await LIST(new Request(`${BASE}?category=HR`))).json();

    expect(all).toHaveLength(2);
    expect(hrOnly.map((request: { title: string }) => request.title)).toEqual(["Payslip question"]);
  });

  it("ignores invalid filter values instead of failing", async () => {
    await createViaApi();
    const response = await LIST(new Request(`${BASE}?category=FINANCE&sort=random`));
    expect(response.status).toBe(200);
    expect(await response.json()).toHaveLength(1);
  });
});

describe("GET /api/requests/:id", () => {
  it("returns the request", async () => {
    const created = await createViaApi();
    const response = await GET_ONE(new Request(`${BASE}/${created.id}`), context(created.id));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ id: created.id, title: "Broken keyboard" });
  });

  it("returns 404 with a JSON error for a missing id", async () => {
    const response = await GET_ONE(new Request(`${BASE}/missing`), context("missing"));
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Request not found" });
  });
});

describe("PATCH /api/requests/:id", () => {
  it("updates only the status (inline status change from the list)", async () => {
    const created = await createViaApi();
    const response = await PATCH(
      jsonRequest("PATCH", `${BASE}/${created.id}`, { status: "IN_PROGRESS" }),
      context(created.id),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ status: "IN_PROGRESS", title: "Broken keyboard" });
  });

  it("validates fields with the same rules as create", async () => {
    const created = await createViaApi();
    const response = await PATCH(
      jsonRequest("PATCH", `${BASE}/${created.id}`, { title: "x".repeat(101) }),
      context(created.id),
    );
    expect(response.status).toBe(400);
    expect((await response.json()).details.fieldErrors.title).toEqual([
      "Title must be at most 100 characters",
    ]);
  });

  it("rejects an empty update with a clear message", async () => {
    const created = await createViaApi();
    const response = await PATCH(jsonRequest("PATCH", `${BASE}/${created.id}`, {}), context(created.id));
    expect(response.status).toBe(400);
    expect((await response.json()).error).toBe("Provide at least one field to update");
  });

  it("returns 404 for a missing id (valid body)", async () => {
    const response = await PATCH(
      jsonRequest("PATCH", `${BASE}/missing`, { status: "COMPLETED" }),
      context("missing"),
    );
    expect(response.status).toBe(404);
  });
});

describe("DELETE /api/requests/:id", () => {
  it("deletes and returns 204, then 404 on a second delete", async () => {
    const created = await createViaApi();
    const first = await DELETE(new Request(`${BASE}/${created.id}`, { method: "DELETE" }), context(created.id));
    const second = await DELETE(new Request(`${BASE}/${created.id}`, { method: "DELETE" }), context(created.id));

    expect(first.status).toBe(204);
    expect(second.status).toBe(404);
    expect(await db.request.count()).toBe(0);
  });
});

describe("unexpected errors", () => {
  it("returns a generic JSON 500 without leaking internal details", async () => {
    vi.spyOn(service, "listRequests").mockRejectedValue(new Error("SQLITE_BUSY: database is locked"));
    vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await LIST(new Request(BASE));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: "Something went wrong. Please try again." });
    expect(JSON.stringify(body)).not.toContain("SQLITE");
  });
});
