import { afterEach, describe, expect, it, vi } from "vitest";
import { apiRequest } from "@/lib/api-client";
import { formatRelativeTime } from "@/lib/format";
import { buildExportHref, buildRequestsHref, hasActiveFilters } from "@/lib/request-query-url";

describe("buildRequestsHref", () => {
  it("is plain /requests with no filters or the default sort", () => {
    expect(buildRequestsHref({})).toBe("/requests");
    expect(buildRequestsHref({ sort: "newest", q: "   " })).toBe("/requests");
  });

  it("includes every active filter and a non-default sort", () => {
    expect(
      buildRequestsHref({ q: " vpn ", category: "IT", status: "NEW", priority: "HIGH", sort: "priority" }),
    ).toBe("/requests?q=vpn&category=IT&status=NEW&priority=HIGH&sort=priority");
  });

  it("encodes search text safely", () => {
    expect(buildRequestsHref({ q: "90% & up" })).toBe("/requests?q=90%25+%26+up");
  });
});

describe("buildExportHref", () => {
  it("carries exactly the list's params to the export route", () => {
    const query = { q: "vpn", category: "IT", status: "NEW", priority: "HIGH", sort: "priority" } as const;
    expect(buildExportHref(query)).toBe(
      `/api/requests/export${buildRequestsHref(query).slice("/requests".length)}`,
    );
  });

  it("has no query string with no filters", () => {
    expect(buildExportHref({ sort: "newest" })).toBe("/api/requests/export");
  });
});

describe("hasActiveFilters", () => {
  it("ignores sort, counts search and filters", () => {
    expect(hasActiveFilters({ sort: "oldest" })).toBe(false);
    expect(hasActiveFilters({ q: "  " })).toBe(false);
    expect(hasActiveFilters({ q: "printer" })).toBe(true);
    expect(hasActiveFilters({ status: "COMPLETED" })).toBe(true);
  });
});

describe("formatRelativeTime", () => {
  const now = new Date("2026-11-25T12:00:00Z");
  const ago = (seconds: number) => new Date(now.getTime() - seconds * 1000);

  it.each([
    [10, "just now"],
    [90, "1 minute ago"],
    [2 * 3600, "2 hours ago"],
    [26 * 3600, "yesterday"],
    [3 * 86400, "3 days ago"],
    [15 * 86400, "2 weeks ago"],
    [70 * 86400, "2 months ago"],
  ])("%i seconds ago reads as %s", (seconds, expected) => {
    expect(formatRelativeTime(ago(seconds), now)).toBe(expected);
  });
});

describe("apiRequest", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("returns data on success and undefined for 204", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(Response.json({ id: "1" })));
    expect(await apiRequest("/api/requests/1")).toEqual({ ok: true, data: { id: "1" } });

    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(new Response(null, { status: 204 })));
    expect(await apiRequest("/api/requests/1", { method: "DELETE" })).toEqual({ ok: true, data: undefined });
  });

  it("surfaces the API's error message and field errors", async () => {
    const body = { error: "Some fields are invalid.", details: { formErrors: [], fieldErrors: { title: ["Too short"] } } };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(Response.json(body, { status: 400 })));
    expect(await apiRequest("/api/requests", { method: "POST" })).toEqual({
      ok: false,
      status: 400,
      error: "Some fields are invalid.",
      fieldErrors: { title: ["Too short"] },
    });
  });

  it("turns a network failure or a non-JSON error into a readable message", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValueOnce(new TypeError("Failed to fetch")));
    expect(await apiRequest("/api/requests")).toMatchObject({ ok: false, status: 0, error: expect.stringContaining("Couldn't reach") });

    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(new Response("<html>502</html>", { status: 502 })));
    expect(await apiRequest("/api/requests")).toMatchObject({ ok: false, status: 502, error: "Something went wrong. Please try again." });
  });
});

describe("percentOf", () => {
  it("rounds to a whole percent and handles an empty total", async () => {
    const { percentOf } = await import("@/lib/format");
    expect(percentOf(14, 30)).toBe(47);
    expect(percentOf(1, 3)).toBe(33);
    expect(percentOf(0, 0)).toBe(0);
    expect(percentOf(5, 5)).toBe(100);
  });
});
