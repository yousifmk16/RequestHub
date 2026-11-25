import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import {
  createRequest,
  deleteRequest,
  getRequest,
  getRequestStats,
  listRecentRequests,
  listRequests,
  updateRequest,
} from "@/lib/services/requests";
import type { RequestCreateInput } from "@/lib/validation";

const DAY = 24 * 60 * 60 * 1000;

// Inserts rows with explicit, spaced-out creation dates so ordering is testable.
async function insert(rows: Array<Partial<RequestCreateInput> & { daysAgo: number; status?: "NEW" | "IN_PROGRESS" | "COMPLETED" }>) {
  const now = Date.now();
  for (const { daysAgo, ...row } of rows) {
    await db.request.create({
      data: {
        title: "Untitled request",
        description: "A description long enough.",
        category: "OTHER",
        priority: "LOW",
        ...row,
        createdAt: new Date(now - daysAgo * DAY),
      },
    });
  }
}

const titles = (requests: Array<{ title: string }>) => requests.map((request) => request.title);

beforeEach(async () => {
  await db.request.deleteMany();
});

describe("listRequests", () => {
  beforeEach(async () => {
    await insert([
      { title: "VPN keeps disconnecting", category: "IT", priority: "HIGH", status: "NEW", daysAgo: 1 },
      { title: "Update emergency contact", category: "HR", priority: "LOW", status: "COMPLETED", daysAgo: 2 },
      { title: "Order standing desk", category: "ADMINISTRATION", priority: "MEDIUM", status: "IN_PROGRESS", daysAgo: 3 },
      { title: "Printer jam", description: "Third floor printer shows a VPN error?", category: "IT", priority: "LOW", status: "NEW", daysAgo: 4 },
      { title: "Parking permit renewal", category: "OTHER", priority: "HIGH", status: "NEW", daysAgo: 5 },
    ]);
  });

  it("returns everything newest first by default", async () => {
    expect(titles(await listRequests({ sort: "newest" }))).toEqual([
      "VPN keeps disconnecting",
      "Update emergency contact",
      "Order standing desk",
      "Printer jam",
      "Parking permit renewal",
    ]);
  });

  it("sorts oldest first", async () => {
    const result = await listRequests({ sort: "oldest" });
    expect(result[0]?.title).toBe("Parking permit renewal");
  });

  it("sorts by priority weight (not alphabetically), newest first within a priority", async () => {
    expect(titles(await listRequests({ sort: "priority" }))).toEqual([
      "VPN keeps disconnecting", // HIGH, 1 day
      "Parking permit renewal", // HIGH, 5 days
      "Order standing desk", // MEDIUM
      "Update emergency contact", // LOW, 2 days
      "Printer jam", // LOW, 4 days
    ]);
  });

  it("searches title and description, case-insensitively", async () => {
    expect(titles(await listRequests({ q: "vpn", sort: "newest" }))).toEqual([
      "VPN keeps disconnecting",
      "Printer jam",
    ]);
  });

  it("treats LIKE wildcards in the search as literal characters", async () => {
    expect(await listRequests({ q: "%", sort: "newest" })).toEqual([]);
    expect(await listRequests({ q: "_", sort: "newest" })).toEqual([]);

    await insert([{ title: "Disk 90% full on build server", daysAgo: 0 }]);
    expect(titles(await listRequests({ q: "90%", sort: "newest" }))).toEqual([
      "Disk 90% full on build server",
    ]);
  });

  it("combines search and every filter with AND", async () => {
    const result = await listRequests({ q: "vpn", category: "IT", status: "NEW", priority: "LOW", sort: "newest" });
    expect(titles(result)).toEqual(["Printer jam"]);
  });

  it("returns an empty list when nothing matches", async () => {
    expect(await listRequests({ category: "HR", status: "NEW", sort: "newest" })).toEqual([]);
  });
});

describe("create, read, update, delete", () => {
  const input: RequestCreateInput = {
    title: "New monitor",
    description: "Second monitor for the design team.",
    category: "IT",
    priority: "MEDIUM",
  };

  it("creates a request with status NEW and timestamps", async () => {
    const created = await createRequest(input);
    expect(created).toMatchObject({ ...input, status: "NEW" });
    expect(created.id).toBeTruthy();
    expect(await getRequest(created.id)).toEqual(created);
  });

  it("updates only the given fields and bumps updatedAt", async () => {
    const created = await createRequest(input);
    const updated = await updateRequest(created.id, { status: "IN_PROGRESS" });
    expect(updated).toMatchObject({ ...input, status: "IN_PROGRESS" });
    expect(updated!.updatedAt.getTime()).toBeGreaterThanOrEqual(created.updatedAt.getTime());
  });

  it("returns null / false for a missing id instead of throwing", async () => {
    expect(await getRequest("missing-id")).toBeNull();
    expect(await updateRequest("missing-id", { status: "COMPLETED" })).toBeNull();
    expect(await deleteRequest("missing-id")).toBe(false);
  });

  it("deletes a request", async () => {
    const created = await createRequest(input);
    expect(await deleteRequest(created.id)).toBe(true);
    expect(await getRequest(created.id)).toBeNull();
  });
});

describe("listRecentRequests", () => {
  it("returns the latest requests up to the limit", async () => {
    await insert([
      { title: "Third", daysAgo: 3 },
      { title: "First", daysAgo: 1 },
      { title: "Second", daysAgo: 2 },
    ]);
    expect(titles(await listRecentRequests(2))).toEqual(["First", "Second"]);
  });
});

describe("getRequestStats", () => {
  it("returns zeros for every value when there are no requests", async () => {
    expect(await getRequestStats()).toEqual({
      total: 0,
      byStatus: { NEW: 0, IN_PROGRESS: 0, COMPLETED: 0 },
      byCategory: { IT: 0, HR: 0, ADMINISTRATION: 0, OTHER: 0 },
      byPriority: { LOW: 0, MEDIUM: 0, HIGH: 0 },
    });
  });

  it("counts by status, category and priority, filling gaps with 0", async () => {
    await insert([
      { category: "IT", priority: "HIGH", status: "NEW", daysAgo: 1 },
      { category: "IT", priority: "LOW", status: "COMPLETED", daysAgo: 2 },
      { category: "HR", priority: "HIGH", status: "NEW", daysAgo: 3 },
    ]);
    expect(await getRequestStats()).toEqual({
      total: 3,
      byStatus: { NEW: 2, IN_PROGRESS: 0, COMPLETED: 1 },
      byCategory: { IT: 2, HR: 1, ADMINISTRATION: 0, OTHER: 0 },
      byPriority: { LOW: 1, MEDIUM: 0, HIGH: 2 },
    });
  });
});

describe("countByStatus", () => {
  it("counts every status, including ones with no requests", async () => {
    const { countByStatus } = await import("@/lib/services/requests");
    expect(countByStatus([{ status: "NEW" }, { status: "NEW" }, { status: "COMPLETED" }])).toEqual({
      NEW: 2,
      IN_PROGRESS: 0,
      COMPLETED: 1,
    });
    expect(countByStatus([])).toEqual({ NEW: 0, IN_PROGRESS: 0, COMPLETED: 0 });
  });
});
