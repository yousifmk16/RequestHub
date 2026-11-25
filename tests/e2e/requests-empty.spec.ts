import { expect, test } from "@playwright/test";

// The e2e database starts empty (scripts/prepare-test-db.mjs), so this is the
// first-run experience: an invitation to create the first request.
test("requests page invites the first request when there are none", async ({ page }) => {
  await page.goto("/requests");

  await expect(page.getByRole("heading", { name: "No requests yet" })).toBeVisible();
  await expect(page.getByText("0 requests")).toBeVisible();
  await expect(page.getByRole("link", { name: "Create the first request" })).toHaveAttribute(
    "href",
    "/requests/new",
  );
});

test("invalid filter values in the URL fall back instead of failing", async ({ page }) => {
  const response = await page.goto("/requests?category=FINANCE&sort=random&status=DONE");

  expect(response?.ok()).toBe(true);
  await expect(page.getByRole("combobox", { name: "Department" })).toHaveText("All departments");
  await expect(page.getByRole("combobox", { name: "Sort" })).toHaveText("Newest first");
});
