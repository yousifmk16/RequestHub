import { expect, type Page, test } from "@playwright/test";
import { createRequest, uniqueToken } from "./helpers";

async function chooseOption(page: Page, comboboxName: string, option: string) {
  await page.getByRole("combobox", { name: comboboxName }).click();
  await page.getByRole("option", { name: option, exact: true }).click();
}

test("status changes inline from the list and survives a reload (R5)", async ({ page, request }, testInfo) => {
  const { title } = await createRequest(request, { title: `Inline status ${uniqueToken(testInfo)}` });
  await page.goto(`/requests?q=${encodeURIComponent(title)}`);

  await chooseOption(page, `Status of ${title}`, "Completed");
  await expect(page.getByText("Status changed to Completed")).toBeVisible();

  await page.reload();
  await expect(page.getByRole("combobox", { name: `Status of ${title}` })).toHaveText("Completed");
});

test("delete asks first, can be cancelled, then removes the request (R4)", async ({ page, request }, testInfo) => {
  const { id, title } = await createRequest(request, { title: `Delete me ${uniqueToken(testInfo)}` });
  await page.goto(`/requests?q=${encodeURIComponent(title)}`);
  const row = page.getByRole("link", { name: title, exact: true });

  await page.getByRole("button", { name: `Delete ${title}` }).click();
  const dialog = page.getByRole("alertdialog");
  await expect(dialog).toContainText(title);
  await dialog.getByRole("button", { name: "Keep request" }).click();
  await expect(dialog).toBeHidden();
  await expect(row).toBeVisible();

  await page.getByRole("button", { name: `Delete ${title}` }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Delete request" }).click();
  await expect(page.getByText("Request deleted")).toBeVisible();
  await expect(row).toBeHidden();
  expect((await request.get(`/api/requests/${id}`)).status()).toBe(404);
});

test("search, status chips, filters and sort combine and survive a reload (R6)", async ({ page, request }, testInfo) => {
  const token = uniqueToken(testInfo);
  await createRequest(request, { title: `${token} urgent laptop`, category: "IT", priority: "HIGH" });
  await createRequest(request, { title: `${token} calm laptop`, category: "IT", priority: "LOW" });
  await createRequest(request, { title: `${token} payroll`, category: "HR", priority: "HIGH", status: "COMPLETED" });

  await page.goto("/requests");
  await page.getByRole("searchbox", { name: "Search requests" }).fill(token);
  await expect(page).toHaveURL(new RegExp(`q=${token}`));
  await expect(page.getByText("3 matching requests")).toBeVisible();

  await page.getByRole("button", { name: /^New 2 requests$/ }).click();
  await expect(page.getByText("2 matching requests")).toBeVisible();
  await chooseOption(page, "Department", "IT");
  await chooseOption(page, "Sort", "Highest priority");
  await expect(page).toHaveURL(/status=NEW/);
  await expect(page).toHaveURL(/category=IT/);
  await expect(page).toHaveURL(/sort=priority/);

  const titles = page.getByRole("list", { name: "Requests" }).getByRole("link", { name: new RegExp(`^${token}`) });
  await expect(titles).toHaveText([`${token} urgent laptop`, `${token} calm laptop`]);

  await page.reload();
  await expect(page.getByRole("searchbox", { name: "Search requests" })).toHaveValue(token);
  await expect(page.getByRole("button", { name: /^New 2 requests$/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("combobox", { name: "Department" })).toHaveText("IT");
  await expect(titles).toHaveText([`${token} urgent laptop`, `${token} calm laptop`]);

  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.getByRole("searchbox", { name: "Search requests" })).toHaveValue("");
  await expect(page).toHaveURL(/\/requests\?sort=priority$/);
});

test("dashboard reflects a status change made in the list (R7)", async ({ page, request }, testInfo) => {
  const { title } = await createRequest(request, { title: `Dashboard sync ${uniqueToken(testInfo)}` });
  // Read the card's accessible name ("Completed 3 60% of all requests"): its raw
  // text runs the count and percentage together ("Completed360%").
  const completedCount = async () => {
    const snapshot = await page.getByRole("region", { name: "At a glance" }).ariaSnapshot();
    return Number(snapshot.match(/link "Completed (\d+) /)?.[1]);
  };

  await page.goto("/");
  const before = await completedCount();

  await page.goto(`/requests?q=${encodeURIComponent(title)}`);
  await chooseOption(page, `Status of ${title}`, "Completed");
  await expect(page.getByText("Status changed to Completed")).toBeVisible();

  await page.goto("/");
  await expect.poll(completedCount).toBe(before + 1);
});
