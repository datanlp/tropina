import { expect, test } from "./fixtures";

const MARKET = "/poland/christmas-markets/krakow/test-rynek-glowny";

test.describe("SEO", () => {
  test("market page has title, description, canonical and hreflang for 4 languages", async ({
    page,
  }) => {
    await page.goto(`/pl${MARKET}`);
    await expect(page).toHaveTitle(/TEST Jarmark/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /TEST/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://tropina.app/pl${MARKET}`,
    );
    for (const lang of ["en", "pl", "ru", "uk", "x-default"]) {
      await expect(page.locator(`link[rel="alternate"][hreflang="${lang}"]`)).toHaveCount(1);
    }
  });

  test("market page has a JSON-LD Event", async ({ page }) => {
    await page.goto(`/en${MARKET}`);
    const raw = await page.locator('script[type="application/ld+json"]').first().textContent();
    const ld = JSON.parse(raw ?? "{}");
    expect(ld["@type"]).toBe("Event");
    expect(ld.startDate).toBe("2026-11-28");
    expect(ld.location.geo.latitude).toBe(50.0617);
  });

  test("list page has hreflang too", async ({ page }) => {
    await page.goto("/ru/poland/christmas-markets");
    await expect(page.locator('link[rel="alternate"][hreflang="uk"]')).toHaveAttribute(
      "href",
      "https://tropina.app/uk/poland/christmas-markets",
    );
  });

  test("sitemap.xml lists markets in every language", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    const xml = await res.text();
    for (const lang of ["en", "pl", "ru", "uk"]) {
      expect(xml).toContain(`https://tropina.app/${lang}${MARKET}`);
    }
  });

  test("robots.txt points to the sitemap", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(await res.text()).toContain("Sitemap: https://tropina.app/sitemap.xml");
  });

  test("a city with one market redirects to that market", async ({ page }) => {
    await page.goto("/uk/poland/christmas-markets/krakow");
    await expect(page).toHaveURL(`/uk${MARKET}`);
  });
});
