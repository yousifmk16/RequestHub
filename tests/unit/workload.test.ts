import { describe, expect, it } from "vitest";
import { describeWorkload, litBarCount } from "@/lib/workload";

describe("litBarCount", () => {
  it("lights every bar when there are no requests (nothing is waiting)", () => {
    expect(litBarCount({ total: 0, completed: 0 })).toBe(4);
  });

  it("lights every bar only when everything is completed", () => {
    expect(litBarCount({ total: 30, completed: 30 })).toBe(4);
    expect(litBarCount({ total: 30, completed: 29 })).toBe(3);
  });

  it("lights no bars when nothing is completed", () => {
    expect(litBarCount({ total: 12, completed: 0 })).toBe(0);
  });

  it("lights one bar per full quarter completed", () => {
    expect(litBarCount({ total: 8, completed: 1 })).toBe(0); // 12.5%
    expect(litBarCount({ total: 8, completed: 2 })).toBe(1); // 25%
    expect(litBarCount({ total: 8, completed: 4 })).toBe(2); // 50%
    expect(litBarCount({ total: 8, completed: 6 })).toBe(3); // 75%
    expect(litBarCount({ total: 30, completed: 14 })).toBe(1); // seed data: 46.7%
  });

  it("stays within 0-4 even for inconsistent input", () => {
    expect(litBarCount({ total: 5, completed: 9 })).toBe(4);
    expect(litBarCount({ total: 5, completed: -1 })).toBe(0);
  });
});

describe("describeWorkload", () => {
  it("describes each state in plain words", () => {
    expect(describeWorkload({ total: 0, completed: 0 })).toBe("No requests yet");
    expect(describeWorkload({ total: 4, completed: 4 })).toBe("All 4 requests completed");
    expect(describeWorkload({ total: 30, completed: 14 })).toBe(
      "14 of 30 requests completed, 16 open",
    );
  });
});
