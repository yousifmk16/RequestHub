import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_DATABASE_URL, getDatabaseConfig } from "@/lib/database-config";

describe("getDatabaseConfig", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("falls back to the local SQLite file when nothing is configured", () => {
    vi.stubEnv("DATABASE_URL", "");
    vi.stubEnv("DATABASE_AUTH_TOKEN", "");
    expect(getDatabaseConfig()).toEqual({ url: DEFAULT_DATABASE_URL, authToken: undefined });
  });

  it("refuses the local fallback on Vercel, naming the fix", () => {
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("DATABASE_URL", "");
    expect(() => getDatabaseConfig()).toThrow(/DATABASE_URL is not set/);
  });

  it("uses the configured Turso URL and token in production", () => {
    vi.stubEnv("DATABASE_URL", "libsql://request-hub.turso.io");
    vi.stubEnv("DATABASE_AUTH_TOKEN", "test-token");
    expect(getDatabaseConfig()).toEqual({
      url: "libsql://request-hub.turso.io",
      authToken: "test-token",
    });
  });
});
