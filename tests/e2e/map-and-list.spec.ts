import en from "../../messages/en.json";
import { expect, test } from "./fixtures";

const PAGE = "/en/poland/christmas-markets";
const KRAKOW = "/en/poland/christmas-markets/krakow/test-rynek-glowny";
const WROCLAW = "/en/poland/christmas-markets/wroclaw/test-rynek";

test.describe("map and list", () => {
  test("has a labelled map region next to the list", async ({ page }) => {
    await page.goto(PAGE);
    // On a phone the map starts hidden (list view), so include hidden elements.
    await expect(
      page.getByRole("region", { name: en.Explorer.mapLabel, includeHidden: true }),
    ).toBeAttached();
    await expect(page.getByRole("list", { name: en.Explorer.listLabel })).toBeVisible();
  });

  test("every market can be reached with the keyboard", async ({ page, isMobile }) => {
    test.skip(isMobile, "keyboard navigation is checked on desktop");
    await page.goto(PAGE);
    const reached = new Set<string>();
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press("Tab");
      const href = await page.evaluate(() => document.activeElement?.getAttribute("href") ?? "");
      if (href) reached.add(href);
    }
    expect([...reached]).toEqual(expect.arrayContaining([KRAKOW, WROCLAW]));
  });

  test("selecting a market in the list selects it on the map", async ({ page }) => {
    await page.goto(PAGE);
    const items = page.getByRole("list", { name: en.Explorer.listLabel }).getByRole("listitem");
    const krakow = items.filter({ hasText: "TEST Main Square" });
    const wroclaw = items.filter({ hasText: "TEST Wrocław" });
    const map = page.getByTestId("market-map");

    await krakow.getByRole("button", { name: en.Explorer.showOnMap }).click();
    await expect(krakow.getByRole("button", { name: en.Explorer.showOnMap })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(map).toHaveAttribute("data-selected", "krakow-test-rynek-glowny");

    await wroclaw.getByRole("button", { name: en.Explorer.showOnMap }).click();
    await expect(map).toHaveAttribute("data-selected", "wroclaw-test-rynek");
    await expect(krakow.getByRole("button", { name: en.Explorer.showOnMap })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  test("phone: Map / List switch", async ({ page, isMobile }) => {
    test.skip(!isMobile, "the switch exists only on narrow screens");
    await page.goto(PAGE);
    const list = page.getByRole("list", { name: en.Explorer.listLabel });
    const map = page.getByTestId("market-map");

    await page.getByRole("button", { name: en.Explorer.viewMap, exact: true }).click();
    await expect(map).toBeVisible();
    await expect(list).toBeHidden();

    await page.getByRole("button", { name: en.Explorer.viewList, exact: true }).click();
    await expect(list).toBeVisible();
    await expect(map).toBeHidden();
  });

  test("desktop: no Map / List switch, both visible", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop only");
    await page.goto(PAGE);
    await expect(page.getByRole("button", { name: en.Explorer.viewMap, exact: true })).toBeHidden();
    await expect(page.getByTestId("market-map")).toBeVisible();
    await expect(page.getByRole("list", { name: en.Explorer.listLabel })).toBeVisible();
  });
});

test.describe("market card", () => {
  test("has directions, official site, checks and transport", async ({ page }) => {
    await page.goto(KRAKOW);
    await expect(page.getByRole("link", { name: en.MarketPage.directions })).toHaveAttribute(
      "href",
      "https://www.google.com/maps/dir/?api=1&destination=50.0617,19.9373",
    );
    await expect(page.getByRole("link", { name: en.MarketPage.officialSite })).toBeVisible();
    await expect(page.getByRole("heading", { name: en.MarketPage.transport })).toBeVisible();
    await expect(page.getByRole("heading", { name: en.MarketPage.accessibility })).toBeVisible();
  });

  test("shows who suggested the market", async ({ page }) => {
    await page.goto(WROCLAW);
    await expect(page.getByText("@test_user")).toBeVisible();
  });
});
