import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET as EXPORT_CSV } from "@/app/api/requests/export/route";
import { db } from "@/lib/db";
import * as service from "@/lib/services/requests";

/**
 * GET /api/requests/export, called directly with real Request objects against
 * the test database (like api-routes.test.ts). The escaping rules themselves
 * are covered in csv.test.ts; this checks the route's contract.
 */

const EXPORT = "http://localhost/api/requests/export";
const HEADER = "ID,Title,Description,Department,Priority,Status,Created,Updated";

const validInput = {
  title: "Broken keyboard",
  description: "Several keys stopped working after a coffee spill.",
  category: "IT",
  priority: "MEDIUM",
} as const;

function create(overrides: Partial<Parameters<typeof service.createRequest>[0]> = {}) {
  return service.createRequest({ ...validInput, ...overrides });
}

async function exportCsv(query = "") {
  const response = await EXPORT_CSV(new Request(`${EXPORT}${query}`));
  // .text() would drop a leading BOM, so decode the raw bytes instead.
  const text = new TextDecoder("utf-8", { ignoreBOM: true }).decode(await response.arrayBuffer());
  return { response, text, lines: text.replace(/^﻿/, "").trimEnd().split("\r\n") };
}

beforeEach(async () => {
  await db.request.deleteMany();
  vi.restoreAllMocks();
});

describe("GET /api/requests/export", () => {
  it("downloads UTF-8 CSV with a BOM and an attachment filename", async () => {
    const { response, text } = await exportCsv();
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("text/csv; charset=utf-8");
    expect(response.headers.get("Content-Disposition")).toMatch(/^attachment; filename="requests-\d{4}-\d{2}-\d{2}\.csv"$/);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(text.startsWith(`﻿${HEADER}\r\n`)).toBe(true);
  });

  it("applies the list's filters and sort, so the file matches the screen", async () => {
    await create({ title: "Old IT request", priority: "LOW" });
    await create({ title: "Urgent IT request", priority: "HIGH" });
    await create({ title: "Payslip question", category: "HR", priority: "HIGH" });

    const { lines } = await exportCsv("?category=IT&sort=priority");
    expect(lines.slice(1).map((line) => line.split(",")[1])).toEqual(["Urgent IT request", "Old IT request"]);
  });

  it("escapes quotes, commas and line breaks, and writes ISO dates", async () => {
    const created = await create({
      title: 'Desk "B12", by the window',
      description: "Line one.\nLine two, with a comma.",
    });

    const { text } = await exportCsv();
    expect(text).toContain(
      `${created.id},"Desk ""B12"", by the window","Line one.\nLine two, with a comma.",IT,Medium,New,` +
        `${created.createdAt.toISOString()},${created.updatedAt.toISOString()}\r\n`,
    );
  });

  it("returns just the header when nothing matches", async () => {
    await create();
    const { lines } = await exportCsv("?q=nothing-matches-this");
    expect(lines).toEqual([HEADER]);
  });

  it("ignores invalid filter values, like the list", async () => {
    await create();
    const { response, lines } = await exportCsv("?category=FINANCE&sort=random");
    expect(response.status).toBe(200);
    expect(lines).toHaveLength(2);
  });

  it("fails as JSON 500 without leaking details", async () => {
    vi.spyOn(service, "listRequests").mockRejectedValue(new Error("SQLITE_BUSY: database is locked"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const response = await EXPORT_CSV(new Request(EXPORT));
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Something went wrong. Please try again." });
  });
});
