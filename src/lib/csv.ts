import { CATEGORY_LABELS, PRIORITY_LABELS, STATUS_LABELS } from "@/lib/constants";
import type { Request } from "@/lib/services/requests";

/**
 * CSV for the "Export CSV" button (RFC 4180). Pure functions, so the escaping
 * rules are unit-tested without a database or a route.
 */

// Excel only reads a CSV as UTF-8 when it starts with a byte order mark;
// without it, "café" or an Arabic title turns into mojibake.
export const CSV_BOM = "﻿";

// RFC 4180 line ending; Excel and every CSV parser accept it.
const LINE_END = "\r\n";

// A cell starting with one of these is run as a formula by Excel, Sheets and
// LibreOffice ("CSV injection"). Titles come from anyone with the link, so
// such cells get a leading apostrophe and stay plain text (docs/decisions.md D17).
const FORMULA_START = /^[=+\-@\t\r]/;

/** One cell: formula-safe, and quoted when it holds a quote, comma or line break. */
export function escapeCsvField(value: string): string {
  const safe = FORMULA_START.test(value) ? `'${value}` : value;
  return /[",\r\n]/.test(safe) ? `"${safe.replaceAll('"', '""')}"` : safe;
}

/** Rows of cells to CSV text (no BOM; see CSV_BOM). */
export function toCsv(rows: readonly (readonly string[])[]): string {
  return rows.map((row) => row.map(escapeCsvField).join(",")).join(LINE_END) + LINE_END;
}

const REQUEST_COLUMNS = ["ID", "Title", "Description", "Department", "Priority", "Status", "Created", "Updated"];

/** Requests as CSV, in the order given, with the UI's labels and ISO 8601 UTC dates. */
export function requestsToCsv(requests: readonly Request[]): string {
  return toCsv([
    REQUEST_COLUMNS,
    ...requests.map((request) => [
      request.id,
      request.title,
      request.description,
      CATEGORY_LABELS[request.category],
      PRIORITY_LABELS[request.priority],
      STATUS_LABELS[request.status],
      request.createdAt.toISOString(),
      request.updatedAt.toISOString(),
    ]),
  ]);
}
