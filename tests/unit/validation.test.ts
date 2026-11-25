import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  parseRequestQuery,
  requestCreateSchema,
  requestUpdateSchema,
} from "@/lib/validation";

const validInput = {
  title: "Laptop won't charge",
  description: "The charger light stays off since this morning.",
  category: "IT",
  priority: "HIGH",
};

function fieldErrors(
  result: { success: boolean; error?: z.ZodError },
): Record<string, string[] | undefined> {
  return result.error ? z.flattenError(result.error).fieldErrors : {};
}

describe("requestCreateSchema", () => {
  it("accepts valid input and trims surrounding whitespace", () => {
    const result = requestCreateSchema.parse({ ...validInput, title: "  Laptop won't charge  " });
    expect(result.title).toBe("Laptop won't charge");
  });

  it("measures length after trimming, so whitespace can't pad a short title", () => {
    const result = requestCreateSchema.safeParse({ ...validInput, title: "  ab   " });
    expect(fieldErrors(result).title).toEqual(["Title must be at least 3 characters"]);
  });

  it("enforces the title and description length limits", () => {
    const result = requestCreateSchema.safeParse({
      ...validInput,
      title: "x".repeat(101),
      description: "too short",
    });
    expect(fieldErrors(result)).toMatchObject({
      title: ["Title must be at most 100 characters"],
      description: ["Description must be at least 10 characters"],
    });
  });

  it("accepts values exactly at the limits", () => {
    const result = requestCreateSchema.safeParse({
      ...validInput,
      title: "x".repeat(100),
      description: "y".repeat(2000),
    });
    expect(result.success).toBe(true);
  });

  it("reports every missing field with a readable message", () => {
    const result = requestCreateSchema.safeParse({});
    expect(fieldErrors(result)).toEqual({
      title: ["Title is required"],
      description: ["Description is required"],
      category: ["Choose a category"],
      priority: ["Choose a priority"],
    });
  });

  it("rejects values outside the enums", () => {
    const result = requestCreateSchema.safeParse({ ...validInput, category: "FINANCE", priority: "urgent" });
    expect(fieldErrors(result)).toMatchObject({
      category: ["Choose a category"],
      priority: ["Choose a priority"],
    });
  });

  it("ignores a status sent on create (new requests always start as NEW)", () => {
    const result = requestCreateSchema.parse({ ...validInput, status: "COMPLETED" });
    expect(result).not.toHaveProperty("status");
  });
});

describe("requestUpdateSchema", () => {
  it("accepts a status-only update", () => {
    expect(requestUpdateSchema.parse({ status: "IN_PROGRESS" })).toEqual({ status: "IN_PROGRESS" });
  });

  it("still validates any field that is present", () => {
    const result = requestUpdateSchema.safeParse({ title: "a", status: "DONE" });
    expect(fieldErrors(result)).toMatchObject({
      title: ["Title must be at least 3 characters"],
      status: ["Choose a valid status"],
    });
  });

  it("rejects an empty update", () => {
    const result = requestUpdateSchema.safeParse({});
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Provide at least one field to update");
  });
});

describe("parseRequestQuery", () => {
  it("defaults to no filters, newest first", () => {
    expect(parseRequestQuery({})).toEqual({ sort: "newest" });
  });

  it("reads valid filters from URLSearchParams", () => {
    const params = new URLSearchParams("q=vpn&category=IT&status=NEW&priority=HIGH&sort=priority");
    expect(parseRequestQuery(params)).toEqual({
      q: "vpn",
      category: "IT",
      status: "NEW",
      priority: "HIGH",
      sort: "priority",
    });
  });

  it("drops invalid or repeated values instead of failing", () => {
    expect(
      parseRequestQuery({ category: "FINANCE", status: ["NEW", "COMPLETED"], sort: "random" }),
    ).toEqual({ sort: "newest" });
  });

  it("treats a blank search as no search", () => {
    expect(parseRequestQuery({ q: "   " })).toEqual({ sort: "newest" });
  });

  it("drops an overly long search term", () => {
    expect(parseRequestQuery({ q: "x".repeat(101) })).toEqual({ sort: "newest" });
  });
});
