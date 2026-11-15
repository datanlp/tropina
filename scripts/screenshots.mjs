// Takes preview screenshots of the running app (default http://localhost:3100)
// into ./screenshots. Used by CI so the map can be seen with real tiles.
import { mkdirSync } from "node:fs";
import { chromium, devices } from "@playwright/test";

const base = process.env.BASE_URL ?? "http://localhost:3100";
mkdirSync("screenshots", { recursive: true });

const browser = await chromium.launch(
  process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {},
);

async function shot(name, url, contextOptions, prepare) {
  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();
  await page.goto(base + url);
  if (prepare) await prepare(page);
  await page.waitForTimeout(4000); // let tiles render
  await page.screenshot({ path: `screenshots/${name}.png` });
  await context.close();
}

await shot("desktop-ru", "/ru/poland/christmas-markets", {
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});
await shot(
  "desktop-ru-selected",
  "/ru/poland/christmas-markets",
  { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 },
  (page) => page.getByRole("button", { name: "Показать на карте" }).nth(3).click(),
);
await shot("mobile-uk-map", "/uk/poland/christmas-markets", devices["Pixel 7"], (page) =>
  page.getByRole("button", { name: "Мапа", exact: true }).click(),
);

await browser.close();
console.log("Screenshots saved to ./screenshots");
