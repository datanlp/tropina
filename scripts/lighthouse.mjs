// Lighthouse on the running app (default http://localhost:3100), phone profile.
// Fails if performance or accessibility drops below 90 (stage 6 gate).
// Chrome: CHROME_PATH, else PW_CHROMIUM_PATH, else Playwright's own Chromium.
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "@playwright/test";
import * as chromeLauncher from "chrome-launcher";
import lighthouse from "lighthouse";

const base = process.env.BASE_URL ?? "http://localhost:3100";
const pages = (process.env.LIGHTHOUSE_PAGES ?? "/en/poland/christmas-markets").split(",");
const MIN = 90;
const GATED = ["performance", "accessibility"];

const chromePath =
  process.env.CHROME_PATH ?? process.env.PW_CHROMIUM_PATH ?? chromium.executablePath();
const chrome = await chromeLauncher.launch({
  chromePath,
  chromeFlags: ["--headless=new", "--no-sandbox"],
});

mkdirSync("lighthouse", { recursive: true });
let failed = false;
try {
  for (const path of pages) {
    const result = await lighthouse(base + path, {
      port: chrome.port,
      output: "html",
      logLevel: "error",
      onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
    });
    const scores = Object.fromEntries(
      Object.entries(result.lhr.categories).map(([k, v]) => [k, Math.round(v.score * 100)]),
    );
    const low = GATED.filter((k) => scores[k] < MIN);
    if (low.length) failed = true;
    console.log(`${low.length ? "FAIL" : "ok  "} ${path} ${JSON.stringify(scores)}`);
    writeFileSync(`lighthouse/${path.replace(/\W+/g, "_")}.html`, result.report);
  }
} finally {
  await chrome.kill();
}
if (failed) {
  console.error(`Lighthouse: performance and accessibility must be at least ${MIN}.`);
  process.exit(1);
}
