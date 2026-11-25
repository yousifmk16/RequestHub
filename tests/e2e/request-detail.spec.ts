import { expect, test } from "@playwright/test";
import { createRequest, uniqueToken } from "./helpers";

test("the list title opens a read-only detail page with every field", async ({ page, request }, testInfo) => {
  const { id, title } = await createRequest(request, {
    title: `Detail view ${uniqueToken(testInfo)}`,
    description: "First line of the description.\nSecond line stays on its own line.",
    category: "HR",
    priority: "HIGH",
    status: "IN_PROGRESS",
  });

  await page.goto(`/requests?q=${encodeURIComponent(title)}`);
  await page.getByRole("list", { name: "Requests" }).getByRole("link", { name: title, exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/requests/${id}$`));

  const article = page.getByRole("article", { name: title });
  await expect(article.getByRole("heading", { level: 1, name: title })).toBeVisible();
  await expect(article.getByRole("definition").filter({ hasText: "HR" })).toBeVisible();
  await expect(article.getByRole("definition").filter({ hasText: "High" })).toBeVisible();
  await expect(article.getByRole("combobox", { name: `Status of ${title}` })).toHaveText("In Progress");
  // Line breaks typed into the form are kept.
  await expect(article.getByRole("region", { name: "Description" }).getByRole("paragraph")).toHaveText(
    "First line of the description.\nSecond line stays on its own line.",
  );
  await expect(article.getByRole("link", { name: "Edit", exact: true })).toHaveAttribute("href", `/requests/${id}/edit`);
});

test("status changes from the detail page persist after a reload (R5)", async ({ page, request }, testInfo) => {
  const { id, title } = await createRequest(request, { title: `Detail status ${uniqueToken(testInfo)}` });
  await page.goto(`/requests/${id}`);

  await page.getByRole("combobox", { name: `Status of ${title}` }).click();
  await page.getByRole("option", { name: "Completed" }).click();
  await expect(page.getByText("Status changed to Completed")).toBeVisible();

  await page.reload();
  await expect(page.getByRole("combobox", { name: `Status of ${title}` })).toHaveText("Completed");
});

test("deleting from the detail page returns to the list (R4)", async ({ page, request }, testInfo) => {
  const { id } = await createRequest(request, { title: `Detail delete ${uniqueToken(testInfo)}` });
  await page.goto(`/requests/${id}`);

  await page.getByRole("button", { name: "Delete request" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Delete request" }).click();

  await expect(page).toHaveURL(/\/requests$/);
  await expect(page.getByText("Request deleted")).toBeVisible();
  expect((await request.get(`/api/requests/${id}`)).status()).toBe(404);
});

test("a missing id shows the request not-found page (R3)", async ({ page }) => {
  await page.goto("/requests/does-not-exist");
  await expect(page.getByRole("heading", { name: "This request doesn't exist" })).toBeVisible();
});

test("the dashboard's latest requests link to the detail page", async ({ page, request }, testInfo) => {
  const { id, title } = await createRequest(request, { title: `Dashboard detail ${uniqueToken(testInfo)}` });
  await page.goto("/");

  const latest = page.getByRole("region", { name: "Latest requests" });
  await expect(latest.getByRole("link", { name: title, exact: true })).toHaveAttribute("href", `/requests/${id}`);
});
