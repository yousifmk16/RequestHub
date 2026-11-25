import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { createRequest, uniqueToken } from "./helpers";

/**
 * Automated WCAG 2.1 A/AA scan (axe-core) of every page and key state, at
 * desktop and 375px. Automated checks catch roughly a third of issues; the
 * keyboard spec and the manual review in docs/testing.md cover the rest.
 */
async function expectNoViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .exclude("nextjs-portal") // Next's dev/error overlay host, not part of the app
    .analyze();
  const summary = results.violations.map((violation) => ({
    rule: violation.id,
    impact: violation.impact,
    targets: violation.nodes.map((node) => node.target.join(" ")).slice(0, 5),
  }));
  expect(summary).toEqual([]);
}

let editUrl: string;

test.beforeAll(async ({ request }, testInfo) => {
  const created = await createRequest(request, {
    title: `Accessibility check ${uniqueToken(testInfo)}`,
    category: "IT",
    priority: "HIGH",
  });
  editUrl = `/requests/${created.id}/edit`;
});

const PAGES: Array<[name: string, url: string, ready: string]> = [
  ["dashboard", "/", "At a glance"],
  ["requests list", "/requests", "Requests"],
  ["filtered list", "/requests?status=NEW&sort=priority&category=IT", "Requests"],
  ["no matching requests", "/requests?q=zzz-no-match-zzz", "No requests match these filters"],
  ["new request form", "/requests/new", "New request"],
  ["missing request", "/requests/does-not-exist/edit", "This request doesn't exist"],
];

for (const [name, url, ready] of PAGES) {
  test(`${name} has no WCAG 2.1 AA violations`, async ({ page }) => {
    await page.goto(url);
    await expect(page.getByRole("heading", { name: ready })).toBeVisible();
    await expectNoViolations(page);
  });
}

test("edit form has no violations", async ({ page }) => {
  await page.goto(editUrl);
  await expect(page.getByRole("heading", { name: "Edit request" })).toBeVisible();
  await expectNoViolations(page);
});

test("form with validation errors has no violations", async ({ page }) => {
  await page.goto("/requests/new");
  await page.getByRole("button", { name: "Create request" }).click();
  await expect(page.getByText("Title is required")).toBeVisible();
  await expectNoViolations(page);
});

test("open delete dialog has no violations", async ({ page }) => {
  await page.goto(editUrl);
  await page.getByRole("button", { name: "Delete request" }).click();
  await expect(page.getByRole("alertdialog")).toBeVisible();
  await expectNoViolations(page);
});
