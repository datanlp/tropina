import en from "../../messages/en.json";
import pl from "../../messages/pl.json";
import ru from "../../messages/ru.json";
import uk from "../../messages/uk.json";
import { expect, test } from "./fixtures";

const messages = { en, pl, ru, uk } as const;
type Lang = keyof typeof messages;
const langs = Object.keys(messages) as Lang[];

const MARKET = "/poland/christmas-markets/krakow/test-rynek-glowny";
const CITY = "/poland/christmas-markets/krakow";

for (const lang of langs) {
  test.describe(`${lang}`, () => {
    test("markets page opens in its language", async ({ page }) => {
      const res = await page.goto(`/${lang}/poland/christmas-markets`);
      expect(res?.status()).toBe(200);
      await expect(page.locator("html")).toHaveAttribute("lang", lang);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        messages[lang].MarketsPage.title,
      );
    });

    test("city page opens and lists its markets", async ({ page }) => {
      const res = await page.goto(`/${lang}${CITY}`);
      expect(res?.status()).toBe(200);
      await expect(page.locator("html")).toHaveAttribute("lang", lang);
      await expect(page.getByRole("link", { name: /^TEST/ })).toHaveCount(1);
    });

    test("market page opens with an official link", async ({ page }) => {
      const res = await page.goto(`/${lang}${MARKET}`);
      expect(res?.status()).toBe(200);
      await expect(page.locator("html")).toHaveAttribute("lang", lang);
      await expect(page.getByRole("heading", { level: 1 })).toContainText("TEST");
      await expect(
        page.getByRole("link", { name: messages[lang].MarketPage.officialSite }),
      ).toHaveAttribute("href", /^https:\/\//);
    });
  });
}

test.describe("redirects", () => {
  for (const [browserLocale, expected] of [
    ["pl-PL", "pl"],
    ["ru-RU", "ru"],
    ["uk-UA", "uk"],
    ["en-GB", "en"],
    ["de-DE", "en"],
  ] as const) {
    test.describe(`browser language ${browserLocale}`, () => {
      test.use({ locale: browserLocale });
      test(`/ redirects to /${expected}`, async ({ page }) => {
        await page.goto("/");
        await expect(page).toHaveURL(`/${expected}/poland/christmas-markets`);
        await expect(page.locator("html")).toHaveAttribute("lang", expected);
      });
    });
  }

  test("/{lang} redirects to the markets page", async ({ page }) => {
    await page.goto("/pl");
    await expect(page).toHaveURL("/pl/poland/christmas-markets");
  });

  test("an unknown market returns 404", async ({ page }) => {
    const res = await page.goto("/en/poland/christmas-markets/krakow/does-not-exist");
    expect(res?.status()).toBe(404);
  });

  test("an unknown language returns 404", async ({ page }) => {
    const res = await page.goto("/de/poland/christmas-markets");
    expect(res?.status()).toBe(404);
  });
});

test.describe("language switcher", () => {
  test("switches language and keeps the page", async ({ page }) => {
    await page.goto(`/en${MARKET}`);
    await page
      .getByRole("navigation", { name: en.LocaleSwitcher.label })
      .getByRole("link", { name: "Українська" })
      .click();
    await expect(page).toHaveURL(`/uk${MARKET}`);
    await expect(page.locator("html")).toHaveAttribute("lang", "uk");
  });

  test("works with the keyboard and focus is visible", async ({ page }) => {
    await page.goto(`/en/poland/christmas-markets`);
    const link = page
      .getByRole("navigation", { name: en.LocaleSwitcher.label })
      .getByRole("link", { name: "Polski" });
    await link.focus();
    await expect(link).toBeFocused();
    const outline = await link.evaluate((el) => getComputedStyle(el).outlineStyle);
    expect(outline).not.toBe("none");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL("/pl/poland/christmas-markets");
  });
});

test("sets no cookies", async ({ page, context }) => {
  await page.goto("/");
  await page.goto(`/en${MARKET}`);
  expect(await context.cookies()).toEqual([]);
});
