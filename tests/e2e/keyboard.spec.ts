import { expect, test } from "@playwright/test";
import { createRequest, uniqueToken } from "./helpers";

// Everything must work without a mouse (WCAG 2.1.1), with visible focus (2.4.7).

test("skip link moves focus past the header to the main content", async ({ page }) => {
  await page.goto("/requests");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();

  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
});

test("a request can be created with the keyboard only", async ({ page }, testInfo) => {
  const title = `Keyboard only ${uniqueToken(testInfo)}`;
  await page.goto("/requests/new");

  await page.getByLabel("Title", { exact: true }).focus();
  await page.keyboard.type(title);
  await page.keyboard.press("Tab");
  await page.keyboard.type("Created without touching the mouse, to check keyboard access.");

  // Radio groups: Tab enters the group, arrow keys move and select.
  await page.keyboard.press("Tab");
  await page.keyboard.press("ArrowRight"); // IT -> HR
  await expect(page.getByRole("radio", { name: /^HR/ })).toBeChecked();
  await page.keyboard.press("Tab");
  await page.keyboard.press("ArrowRight"); // Low -> Medium
  await page.keyboard.press("ArrowRight"); // Medium -> High
  await expect(page.getByRole("radio", { name: /^High/ })).toBeChecked();

  await page.keyboard.press("Tab"); // Cancel
  await page.keyboard.press("Tab"); // Create request
  await expect(page.getByRole("button", { name: "Create request" })).toBeFocused();
  await page.keyboard.press("Enter");

  await expect(page).toHaveURL(/\/requests$/);
  await expect(page.getByRole("link", { name: title, exact: true })).toBeVisible();
});

test("status chips and the inline status menu work from the keyboard", async ({ page, request }, testInfo) => {
  const { title } = await createRequest(request, { title: `Keyboard status ${uniqueToken(testInfo)}` });
  await page.goto(`/requests?q=${encodeURIComponent(title)}`);

  await page.getByRole("button", { name: /^New 1 request$/ }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/status=NEW/);

  await page.getByRole("combobox", { name: `Status of ${title}` }).focus();
  await page.keyboard.press("Enter");
  // Like a person, wait for the menu to take focus before moving through it.
  await expect(page.getByRole("option", { name: "New" })).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("option", { name: "In Progress" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Status changed to In Progress")).toBeVisible();
});
