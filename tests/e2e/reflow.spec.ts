import { expect, test } from "@playwright/test";
import { createRequest, uniqueToken } from "./helpers";

// WCAG 1.4.10 Reflow: content must work at 320 CSS px wide (400% zoom on a
// 1280px screen) without scrolling the page sideways.
test.use({ viewport: { width: 320, height: 720 } });

test("no page scrolls horizontally at 320px", async ({ page, request }, testInfo) => {
  const { id } = await createRequest(request, {
    title: `Reflow check ${uniqueToken(testInfo)} with a fairly long title to wrap`,
    category: "ADMINISTRATION",
    priority: "HIGH",
  });

  for (const url of ["/", "/requests", "/requests?status=NEW&sort=priority", "/requests/new", `/requests/${id}`, `/requests/${id}/edit`]) {
    await page.goto(url);
    await page.getByRole("heading", { level: 1 }).first().waitFor();
    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(scrollWidth, `${url} scrolls sideways`).toBeLessThanOrEqual(clientWidth);
  }
});
