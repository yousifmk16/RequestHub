import { expect, test } from "@playwright/test";

test("an empty submission shows an error under each field and saves nothing (R1)", async ({ page }) => {
  await page.goto("/requests/new");
  await page.getByRole("button", { name: "Create request" }).click();

  await expect(page.getByText("Title is required")).toBeVisible();
  await expect(page.getByText("Description is required")).toBeVisible();
  await expect(page.getByText("Choose a department")).toBeVisible();
  await expect(page.getByText("Choose a priority")).toBeVisible();
  await expect(page.getByLabel("Title")).toBeFocused();
  await expect(page).toHaveURL(/\/requests\/new$/);
});

test("creates a request, then edits it (R1, R3)", async ({ page }, testInfo) => {
  // Each viewport project gets its own request, since they share one database.
  const title = `Replace broken chair (${testInfo.project.name})`;

  await page.goto("/requests/new");
  await page.getByLabel("Title").fill(title);
  await page.getByLabel("Description").fill("The gas lift on my chair failed and it sinks within minutes.");
  await page.getByRole("group", { name: "Department" }).getByText("Administration").click();
  await page.getByRole("group", { name: "Priority" }).getByText("Medium").click();
  await page.getByRole("button", { name: "Create request" }).click();

  await expect(page).toHaveURL(/\/requests$/);
  await expect(page.getByText("Request created")).toBeVisible();
  await expect(page.getByRole("link", { name: title, exact: true })).toBeVisible();

  await page.getByRole("link", { name: title, exact: true }).click();
  await expect(page.getByRole("heading", { name: "Edit request" })).toBeVisible();
  await expect(page.getByLabel("Title")).toHaveValue(title);
  await page.getByRole("group", { name: "Priority" }).getByText("High").click();
  await page.getByRole("group", { name: "Status" }).getByText("In Progress").click();
  await page.getByRole("button", { name: "Save changes" }).click();

  await expect(page).toHaveURL(/\/requests$/);
  await expect(page.getByText("Changes saved")).toBeVisible();
  await expect(page.getByRole("combobox", { name: `Status of ${title}` })).toHaveText("In Progress");
});

test("editing a request that doesn't exist shows the not-found page (R3)", async ({ page }) => {
  await page.goto("/requests/does-not-exist/edit");
  await expect(page.getByRole("heading", { name: "This request doesn't exist" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Go to all requests" })).toBeVisible();
});
