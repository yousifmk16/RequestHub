import { describe, expect, it } from "vitest";
import { classifyDatabaseError, databaseHint } from "@/lib/database-health";

describe("classifyDatabaseError", () => {
  it.each([
    [new Error("SQLITE_ERROR: no such table: main.Request"), "schema-missing"],
    [new Error("SERVER_ERROR: Server returned HTTP status 401"), "auth-failed"],
    [new Error("Unauthorized: invalid JWT"), "auth-failed"],
    [new TypeError("fetch failed"), "unreachable"],
    [Object.assign(new Error("getaddrinfo ENOTFOUND bad-host.turso.io"), { code: "ENOTFOUND" }), "unreachable"],
    [new Error("URL_INVALID: The URL is not in a valid format"), "unreachable"],
    [new Error("disk I/O error"), "unknown"],
  ])("%s -> %s", (error, expected) => {
    expect(classifyDatabaseError(error)).toBe(expected);
  });

  // Exact shapes captured from @prisma/adapter-libsql against bad settings.
  it.each([
    ["Database error. Code: `N/A`. Message: `SERVER_ERROR: Server returned HTTP status 404`", "P2039", "unreachable"],
    ["Database error. Code: `N/A`. Message: `SERVER_ERROR: Server returned HTTP status 401`", "P2039", "auth-failed"],
    ['URL_SCHEME_NOT_SUPPORTED: The client supports only "libsql:" … got "postgres:"', "URL_SCHEME_NOT_SUPPORTED", "unreachable"],
  ])("real adapter error %s -> %s", (message, code, expected) => {
    expect(classifyDatabaseError(Object.assign(new Error(message), { code }))).toBe(expected);
  });

  it("looks through wrapped errors (driver adapters nest the real cause)", () => {
    const wrapped = new Error("Invalid `prisma.request.count()` invocation", {
      cause: new Error("LibsqlError: SQLITE_ERROR: no such table: Request"),
    });
    expect(classifyDatabaseError(wrapped)).toBe("schema-missing");
  });

  it("never returns raw error text in the hint", () => {
    expect(databaseHint("auth-failed")).not.toContain("JWT");
  });
});
