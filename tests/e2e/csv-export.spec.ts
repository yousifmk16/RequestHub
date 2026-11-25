import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { createRequest, uniqueToken } from "./helpers";

test("Export CSV downloads the current filtered, sorted view", async ({ page, request }, testInfo) => {
  const token = uniqueToken(testInfo);
  // Created low first, so "highest priority" order differs from newest-first.
  await createRequest(request, { title: `${token} low, "quoted"`, category: "HR", priority: "LOW" });
  await createRequest(request, { title: `${token} high`, category: "HR", priority: "HIGH" });
  await createRequest(request, { title: `${token} other department`, category: "IT", priority: "HIGH" });

  await page.goto(`/requests?q=${token}&category=HR&sort=priority`);
  await expect(page.getByText("2 matching requests")).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("link", { name: "Export CSV" }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toMatch(/^requests-\d{4}-\d{2}-\d{2}\.csv$/);
  // The link downloads; it doesn't navigate away from the list.
  await expect(page).toHaveURL(/\/requests\?/);

  const csv = await readFile(await download.path(), "utf8");
  expect(csv.startsWith("﻿ID,Title,Description,Department,Priority,Status,Created,Updated\r\n")).toBe(true);
  const rows = csv.trimEnd().split("\r\n").slice(1);
  expect(rows).toHaveLength(2);
  expect(rows[0]).toContain(`,${token} high,`);
  expect(rows[1]).toContain(`,"${token} low, ""quoted""",`);
  expect(csv).not.toContain("other department");
});
