// Captures the README screenshots from a running Request Hub.
//
//   node scripts/capture-screenshots.mjs                      # the live site
//   node scripts/capture-screenshots.mjs http://localhost:3000
//
// Writes PNGs to docs/screenshots/. Reduced motion is on, so the hero bars are
// captured in their final state rather than mid-animation.
import { mkdirSync } from "node:fs";
import { chromium } from "@playwright/test";

const BASE_URL = process.argv[2] ?? "https://request-hub-ten.vercel.app";
const OUT_DIR = "docs/screenshots";

const SHOTS = [
  { name: "dashboard-desktop", path: "/", viewport: { width: 1280, height: 1180 }, ready: "At a glance" },
  { name: "requests-desktop", path: "/requests", viewport: { width: 1280, height: 900 }, ready: "Requests" },
  { name: "new-request-desktop", path: "/requests/new", viewport: { width: 1280, height: 1000 }, ready: "New request" },
  { name: "dashboard-mobile", path: "/", viewport: { width: 375, height: 812 }, ready: "Every request" },
  { name: "requests-mobile", path: "/requests", viewport: { width: 375, height: 812 }, ready: "Requests" },
];

mkdirSync(OUT_DIR, { recursive: true });
const browser = await chromium.launch();

for (const shot of SHOTS) {
  const page = await browser.newPage({ viewport: shot.viewport, deviceScaleFactor: 2, reducedMotion: "reduce" });
  await page.goto(BASE_URL + shot.path, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: shot.ready }).first().waitFor();
  await page.screenshot({ path: `${OUT_DIR}/${shot.name}.png` });
  console.log(`  saved ${OUT_DIR}/${shot.name}.png`);
  await page.close();
}

await browser.close();
