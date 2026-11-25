import { expect, test } from "@playwright/test";

test("dashboard totals match the data and link to filtered lists (R7)", async ({ page, request }) => {
  // Make sure there is at least one IT request, whatever other specs left behind.
  await request.post("/api/requests", {
    data: {
      title: "Dashboard check: VPN access",
      description: "Created by the dashboard e2e test.",
      category: "IT",
      priority: "HIGH",
    },
  });
  const all: Array<{ status: string; category: string }> = await (await request.get("/api/requests")).json();
  const completed = all.filter((item) => item.status === "COMPLETED").length;
  const it = all.filter((item) => item.category === "IT").length;

  await page.goto("/");

  const glance = page.getByRole("region", { name: "At a glance" });
  // Match accessible names ("Completed 3 60% of all requests"), not raw text,
  // where the count and percentage run together and "3" would match "30".
  await expect(glance.getByRole("link", { name: new RegExp(String.raw`^All requests ${all.length} `) })).toBeVisible();
  await expect(glance.getByRole("link", { name: new RegExp(String.raw`^Completed ${completed} `) })).toBeVisible();

  const itBar = page.getByRole("link", { name: new RegExp(String.raw`^IT ${it} \d+% of all requests$`) });
  await expect(itBar).toBeVisible();
  await itBar.click();
  await expect(page).toHaveURL(/\/requests\?category=IT$/);
  await expect(page.getByText(`${it} matching request`)).toBeVisible();
});
