import { describe, expect, it } from "vitest";
import { CSV_BOM, escapeCsvField, requestsToCsv, toCsv } from "@/lib/csv";
import type { Request } from "@/lib/services/requests";

describe("escapeCsvField", () => {
  it("leaves plain text alone", () => {
    expect(escapeCsvField("Broken keyboard")).toBe("Broken keyboard");
    expect(escapeCsvField("")).toBe("");
  });

  it("quotes fields with a comma", () => {
    expect(escapeCsvField("Keyboard, mouse")).toBe('"Keyboard, mouse"');
  });

  it("doubles quotes and wraps the field", () => {
    expect(escapeCsvField('The "new" laptop')).toBe('"The ""new"" laptop"');
  });

  it("quotes fields with line breaks of either kind", () => {
    expect(escapeCsvField("line one\nline two")).toBe('"line one\nline two"');
    expect(escapeCsvField("line one\r\nline two")).toBe('"line one\r\nline two"');
  });

  it("neutralises cells a spreadsheet would run as a formula", () => {
    expect(escapeCsvField("=HYPERLINK(\"http://x\")")).toBe('"\'=HYPERLINK(""http://x"")"');
    expect(escapeCsvField("+1 555")).toBe("'+1 555");
    expect(escapeCsvField("-5 degrees")).toBe("'-5 degrees");
    expect(escapeCsvField("@team")).toBe("'@team");
    expect(escapeCsvField("\tTabbed")).toBe("'\tTabbed");
  });

  it("only checks the first character for formulas", () => {
    expect(escapeCsvField("a = b + c")).toBe("a = b + c");
  });

  it("keeps non-ASCII text as is", () => {
    expect(escapeCsvField("Café — طلب")).toBe("Café — طلب");
  });
});

describe("toCsv", () => {
  it("joins cells with commas and rows with CRLF, ending in CRLF", () => {
    expect(toCsv([["a", "b"], ["c, d", "e"]])).toBe('a,b\r\n"c, d",e\r\n');
  });
});

describe("requestsToCsv", () => {
  const request: Request = {
    id: "req_1",
    title: 'Monitor "flickers", again',
    description: "It started Monday.\nStill happening.",
    category: "ADMINISTRATION",
    priority: "HIGH",
    status: "IN_PROGRESS",
    createdAt: new Date("2026-11-20T09:30:00.000Z"),
    updatedAt: new Date("2026-11-21T16:05:00.000Z"),
  };

  it("writes a header, then one row per request with UI labels and ISO dates", () => {
    expect(requestsToCsv([request])).toBe(
      "ID,Title,Description,Department,Priority,Status,Created,Updated\r\n" +
        'req_1,"Monitor ""flickers"", again","It started Monday.\nStill happening.",Administration,High,In Progress,2026-11-20T09:30:00.000Z,2026-11-21T16:05:00.000Z\r\n',
    );
  });

  it("is just the header when there are no requests", () => {
    expect(requestsToCsv([])).toBe("ID,Title,Description,Department,Priority,Status,Created,Updated\r\n");
  });

  it("does not include the BOM (the route adds it once)", () => {
    expect(requestsToCsv([request]).startsWith(CSV_BOM)).toBe(false);
    expect(CSV_BOM).toBe("﻿");
  });
});
