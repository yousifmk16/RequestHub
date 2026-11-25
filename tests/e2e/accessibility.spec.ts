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

// Measure colours as they settle, not mid fade-in: with reduced motion the app's
// own CSS finishes animations instantly (a half-faded dialog fails contrast).
test.use({ reducedMotion: "reduce" });

const CHECKED_TITLE_PREFIX = "Accessibility check";
let detailUrl: string;
let editUrl: string;

test.beforeAll(async ({ request }, testInfo) => {
  const created = await createRequest(request, {
    title: `${CHECKED_TITLE_PREFIX} ${uniqueToken(testInfo)}`,
    description: "A request with every field filled in.\nIts description spans two lines.",
    category: "IT",
    // Stays NEW: it is also what the "filtered list" scan (status=NEW, IT) finds
    // on a fresh database, so that scan checks rows rather than the empty state.
    priority: "HIGH",
  });
  detailUrl = `/requests/${created.id}`;
  editUrl = `${detailUrl}/edit`;
});

const PAGES: Array<[name: string, url: string, ready: string | RegExp]> = [
  ["dashboard", "/", "At a glance"],
  ["requests list", "/requests", "Requests"],
  ["filtered list", "/requests?status=NEW&sort=priority&category=IT", "Requests"],
  ["no matching requests", "/requests?q=zzz-no-match-zzz", "No requests match these filters"],
  ["new request form", "/requests/new", "New request"],
  ["missing request", "/requests/does-not-exist", "This request doesn't exist"],
  ["missing request (edit)", "/requests/does-not-exist/edit", "This request doesn't exist"],
];

// Pages whose URL is only known once beforeAll has created the request.
const REQUEST_PAGES: Array<[name: string, url: () => string, ready: string | RegExp]> = [
  ["request detail", () => detailUrl, new RegExp(`^${CHECKED_TITLE_PREFIX}`)],
  ["edit form", () => editUrl, "Edit request"],
];

for (const [name, url, ready] of PAGES) {
  test(`${name} has no WCAG 2.1 AA violations`, async ({ page }) => {
    await page.goto(url);
    await expect(page.getByRole("heading", { name: ready })).toBeVisible();
    await expectNoViolations(page);
  });
}

test("request detail has no violations", async ({ page }) => {
  await page.goto(detailUrl);
  await expect(page.getByRole("heading", { level: 1, name: new RegExp(`^${CHECKED_TITLE_PREFIX}`) })).toBeVisible();
  await expectNoViolations(page);
});

// The theme follows the device by default, so emulating a dark device puts
// every page in dark mode; colour contrast is re-checked against dark tokens.
test.describe("dark mode", () => {
  test.use({ colorScheme: "dark" });

  const darkPages = [...PAGES, ...REQUEST_PAGES].map(
    ([name, url, ready]) => [name, typeof url === "string" ? () => url : url, ready] as const,
  );
  for (const [name, url, ready] of darkPages) {
    test(`${name} has no WCAG 2.1 AA violations in dark mode`, async ({ page }) => {
      await page.goto(url());
      await expect(page.getByRole("heading", { name: ready })).toBeVisible();
      await expect(page.locator("html")).toHaveClass(/\bdark\b/);
      await expectNoViolations(page);
    });
  }

  test("form errors and the open delete dialog have no violations in dark mode", async ({ page }) => {
    await page.goto("/requests/new");
    await page.getByRole("button", { name: "Create request" }).click();
    await expect(page.getByText("Title is required")).toBeVisible();
    await expectNoViolations(page);

    await page.goto(editUrl);
    await page.getByRole("button", { name: "Delete request" }).click();
    await expect(page.getByRole("alertdialog")).toBeVisible();
    await expectNoViolations(page);
  });
});

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
