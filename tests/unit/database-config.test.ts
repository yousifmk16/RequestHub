import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_DATABASE_URL, getDatabaseConfig } from "@/lib/database-config";

describe("getDatabaseConfig", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("falls back to the local SQLite file when nothing is configured", () => {
    vi.stubEnv("DATABASE_URL", "");
    vi.stubEnv("DATABASE_AUTH_TOKEN", "");
    expect(getDatabaseConfig()).toEqual({ url: DEFAULT_DATABASE_URL, authToken: undefined });
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
