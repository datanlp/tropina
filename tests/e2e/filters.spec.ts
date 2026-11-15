import en from "../../messages/en.json";
import { expect, test } from "./fixtures";

const PAGE = "/en/poland/christmas-markets";
const KRAKOW = "/en/poland/christmas-markets/krakow/test-rynek-glowny";

// TEST data: Kraków 28 Nov – 26 Dec, daily 10–22 (24 Dec until 14, 25 Dec closed);
// Wrocław 20 Nov – 31 Dec, Mon–Fri 10–21, Sat–Sun 10–22.

function list(page: import("@playwright/test").Page) {
  return page.getByRole("list", { name: en.Explorer.listLabel });
}

test.describe("filters", () => {
  test("Open now shows only markets open at this moment", async ({ page }) => {
    // Wednesday 25 Nov 2026, 12:00 in Warsaw: Kraków has not started yet.
    await page.clock.setFixedTime(new Date("2026-11-25T12:00:00+01:00"));
    await page.goto(PAGE);
    await page.getByRole("radio", { name: en.Filters.openNow }).check();
    await expect(list(page).getByRole("listitem")).toHaveCount(1);
    await expect(list(page)).toContainText("TEST Wrocław");
  });

  test("This weekend includes markets opening on Saturday", async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-11-25T12:00:00+01:00"));
    await page.goto(PAGE);
    await page.getByRole("radio", { name: en.Filters.weekend }).check();
    await expect(list(page).getByRole("listitem")).toHaveCount(2);
  });

  test("25 December: Kraków is closed now", async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-12-25T12:00:00+01:00"));
    await page.goto(PAGE);
    await page.getByRole("radio", { name: en.Filters.openNow }).check();
    await expect(list(page)).not.toContainText("TEST Main Square");
  });

  test("past markets are hidden from the list", async ({ page }) => {
    // 28 Dec: Kraków is over, Wrocław still running.
    await page.clock.setFixedTime(new Date("2026-12-28T12:00:00+01:00"));
    await page.goto(PAGE);
    await expect(page.getByRole("radio", { name: en.Filters.all })).toBeChecked();
    await expect(list(page).getByRole("listitem")).toHaveCount(1);
    await expect(list(page)).toContainText("TEST Wrocław");
  });

  test("an empty filter says so", async ({ page }) => {
    // Sunday 3 Jan 2027: everything is over.
    await page.clock.setFixedTime(new Date("2027-01-03T12:00:00+01:00"));
    await page.goto(PAGE);
    await expect(page.getByText(en.Filters.noResults)).toBeVisible();
  });
});

test.describe("season status on the market page", () => {
  test("says the season is over and invites next year", async ({ page }) => {
    await page.clock.setFixedTime(new Date("2027-01-03T12:00:00+01:00"));
    await page.goto(KRAKOW);
    await expect(page.getByText(en.SeasonStatus.over)).toBeVisible();
  });

  test("says open now during opening hours", async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-12-01T12:00:00+01:00"));
    await page.goto(KRAKOW);
    await expect(page.getByText(en.SeasonStatus.openNow)).toBeVisible();
  });
});
