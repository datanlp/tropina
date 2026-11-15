import en from "../../messages/en.json";
import { expect, test } from "./fixtures";

const KRAKOW = "/en/poland/christmas-markets/krakow/test-rynek-glowny";
const WROCLAW = "/en/poland/christmas-markets/wroclaw/test-rynek";

test.describe("PWA", () => {
  test("has a web app manifest with icons", async ({ page, request }) => {
    await page.goto(KRAKOW);
    const href = await page.locator('link[rel="manifest"]').getAttribute("href");
    expect(href).toBeTruthy();
    const manifest = await (await request.get(href!)).json();
    expect(manifest.name).toBe("Tropina");
    expect(manifest.display).toBe("standalone");
    const sizes = manifest.icons.map((i: { sizes: string }) => i.sizes);
    expect(sizes).toEqual(expect.arrayContaining(["192x192", "512x512"]));
    expect((await request.get(manifest.icons[0].src)).status()).toBe(200);
  });

  test("market cards work offline after the service worker is ready", async ({ page, context }) => {
    await page.goto("/en/poland/christmas-markets");
    await page.evaluate(() => navigator.serviceWorker.ready);
    // Wait until every card has been precached.
    await expect
      .poll(() =>
        page.evaluate(
          () => (window as unknown as { __tropinaPrecached?: boolean }).__tropinaPrecached,
        ),
      )
      .toBe(true);
    await context.setOffline(true);
    // A card that was never opened before.
    await page.goto(WROCLAW);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("TEST Wrocław");
    await context.setOffline(false);
  });

  test.describe("iPhone", () => {
    test.use({
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
    });

    test("install tip appears only after the second market card", async ({ page }) => {
      await page.goto(KRAKOW);
      await expect(page.getByRole("region", { name: en.Install.title })).toHaveCount(0);
      await page.goto(WROCLAW);
      const tip = page.getByRole("region", { name: en.Install.title });
      await expect(tip).toBeVisible();
      await expect(tip).toContainText(en.Install.iosSteps);

      await tip.getByRole("button", { name: en.Install.dismiss }).click();
      await expect(tip).toHaveCount(0);
      await page.goto(KRAKOW);
      await expect(page.getByRole("region", { name: en.Install.title })).toHaveCount(0);
    });
  });
});

test.describe("analytics", () => {
  test.beforeEach(async ({ page }) => {
    // Stand-in for the Umami script: record events in sessionStorage so they
    // survive navigations, and keep external links from leaving the page.
    await page.addInitScript(() => {
      const w = window as unknown as { umami: unknown };
      w.umami = {
        track: (name: string, data: unknown) => {
          const list = JSON.parse(sessionStorage.getItem("events") ?? "[]");
          list.push([name, data]);
          sessionStorage.setItem("events", JSON.stringify(list));
        },
      };
      document.addEventListener("click", (e) => {
        const a = (e.target as Element).closest?.("a[href^='https://']");
        if (a) e.preventDefault();
      });
    });
  });

  const events = (page: import("@playwright/test").Page) =>
    page.evaluate(
      () => JSON.parse(sessionStorage.getItem("events") ?? "[]") as [string, unknown][],
    );

  test("market_open, directions_click and official_link_click", async ({ page }) => {
    await page.goto(KRAKOW);
    await expect
      .poll(() => events(page))
      .toContainEqual(["market_open", { market: "krakow-test-rynek-glowny" }]);
    await page.getByRole("link", { name: en.MarketPage.directions }).click();
    await page.getByRole("link", { name: en.MarketPage.officialSite }).click();
    const names = (await events(page)).map(([n]) => n);
    expect(names).toEqual(expect.arrayContaining(["directions_click", "official_link_click"]));
  });

  test("filter_change and lang_change", async ({ page }) => {
    await page.goto("/en/poland/christmas-markets");
    await page.getByRole("radio", { name: en.Filters.weekend }).check();
    await expect.poll(() => events(page)).toContainEqual(["filter_change", { filter: "weekend" }]);
    await page
      .getByRole("navigation", { name: en.LocaleSwitcher.label })
      .getByRole("link", { name: "Polski" })
      .click();
    await expect(page).toHaveURL(/\/pl\//);
    await expect.poll(() => events(page)).toContainEqual(["lang_change", { from: "en", to: "pl" }]);
  });
});
