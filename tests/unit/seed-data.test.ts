import { describe, expect, it } from "vitest";
import { SEED_REQUESTS } from "../../prisma/seed-data";
import { CATEGORIES, PRIORITIES, STATUSES } from "@/lib/constants";
import { requestCreateSchema } from "@/lib/validation";

describe("seed data", () => {
  it.each(SEED_REQUESTS.map((request) => [request.title, request] as const))(
    "%s passes the same validation as user input",
    (_title, request) => {
      expect(requestCreateSchema.safeParse(request).success).toBe(true);
    },
  );

  it("covers every category, priority and status so every filter and chart has data", () => {
    const used = (key: "category" | "priority" | "status") =>
      new Set(SEED_REQUESTS.map((request) => request[key]));
    expect(used("category")).toEqual(new Set(CATEGORIES));
    expect(used("priority")).toEqual(new Set(PRIORITIES));
    expect(used("status")).toEqual(new Set(STATUSES));
  });

  it("has unique titles", () => {
    const titles = SEED_REQUESTS.map((request) => request.title);
    expect(new Set(titles).size).toBe(titles.length);
  });
});
