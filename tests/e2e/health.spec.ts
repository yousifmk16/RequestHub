import { expect, test } from "@playwright/test";
import { createRequest, uniqueToken } from "./helpers";

// Runs against a production build, where a route handler that doesn't touch
// the request can be prerendered: the count would then be the build's (0).
test("/api/health reports the live request count, not a build-time snapshot", async ({ request }, testInfo) => {
  const before = await (await request.get("/api/health")).json();
  expect(before.status).toBe("ok");

  await createRequest(request, { title: `Health count ${uniqueToken(testInfo)}` });

  const after = await (await request.get("/api/health")).json();
  expect(after.requests).toBe(before.requests + 1);
});
