import type { APIRequestContext, TestInfo } from "@playwright/test";

type NewRequest = {
  title: string;
  description?: string;
  category?: "IT" | "HR" | "ADMINISTRATION" | "OTHER";
  priority?: "LOW" | "MEDIUM" | "HIGH";
  status?: "NEW" | "IN_PROGRESS" | "COMPLETED";
};

/**
 * Tests share one database (and both viewport projects run every test), so
 * each test tags its data with a token unique to the test run and project.
 */
export function uniqueToken(testInfo: TestInfo): string {
  return `${testInfo.project.name}${Date.now().toString(36)}`;
}

/** Creates a request through the public API (and sets its status if given). */
export async function createRequest(api: APIRequestContext, input: NewRequest): Promise<{ id: string; title: string }> {
  const response = await api.post("/api/requests", {
    data: {
      description: "Created by an end-to-end test.",
      category: "OTHER",
      priority: "LOW",
      ...input,
    },
  });
  if (response.status() !== 201) throw new Error(`Seeding failed: ${response.status()} ${await response.text()}`);
  const created: { id: string; title: string } = await response.json();

  if (input.status && input.status !== "NEW") {
    const patched = await api.patch(`/api/requests/${created.id}`, { data: { status: input.status } });
    if (!patched.ok()) throw new Error(`Setting status failed: ${patched.status()}`);
  }
  return created;
}
