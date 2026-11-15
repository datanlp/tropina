import { describe, expect, it } from "vitest";
import { SITE_URL, alternatesFor, marketEventJsonLd, sitemapEntries } from "@/lib/seo";
import { singleMarketRedirect } from "@/lib/known-paths";
import { validMarket } from "./fixtures";

describe("alternatesFor", () => {
  it("gives a canonical URL and hreflang for all four languages plus x-default", () => {
    const a = alternatesFor("/poland/christmas-markets/krakow", "pl");
    expect(a.canonical).toBe(`${SITE_URL}/pl/poland/christmas-markets/krakow`);
    expect(a.languages).toEqual({
      en: `${SITE_URL}/en/poland/christmas-markets/krakow`,
      pl: `${SITE_URL}/pl/poland/christmas-markets/krakow`,
      ru: `${SITE_URL}/ru/poland/christmas-markets/krakow`,
      uk: `${SITE_URL}/uk/poland/christmas-markets/krakow`,
      "x-default": `${SITE_URL}/en/poland/christmas-markets/krakow`,
    });
  });
});

describe("marketEventJsonLd", () => {
  it("describes the market as a schema.org Event in the page language", () => {
    const m = validMarket();
    const ld = marketEventJsonLd(m, "ru");
    expect(ld).toMatchObject({
      "@context": "https://schema.org",
      "@type": "Event",
      name: m.name.ru,
      description: m.description.ru,
      startDate: "2026-11-28",
      endDate: "2026-12-26",
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      inLanguage: "ru",
      url: `${SITE_URL}/ru/poland/christmas-markets/krakow/rynek-glowny`,
      location: {
        "@type": "Place",
        name: m.city.name.ru,
        address: m.location.address,
        geo: { "@type": "GeoCoordinates", latitude: 50.0617, longitude: 19.9373 },
      },
    });
  });
});

describe("sitemapEntries", () => {
  it("lists the main page and every market in four languages, without one-market city pages", () => {
    const entries = sitemapEntries([validMarket()]);
    const urls = entries.map((e) => e.url);
    expect(urls).toContain(`${SITE_URL}/en/poland/christmas-markets`);
    expect(urls).toContain(`${SITE_URL}/uk/poland/christmas-markets/krakow/rynek-glowny`);
    // Kraków has one market, so its city URL only redirects and is not listed.
    expect(urls).not.toContain(`${SITE_URL}/en/poland/christmas-markets/krakow`);
    expect(entries).toHaveLength(8);
    expect(entries[0].alternates?.languages).toHaveProperty("uk");
  });

  it("lists city pages for cities with several markets", () => {
    const a = validMarket();
    const b = { ...validMarket(), slug: "maly-rynek", id: "krakow-maly-rynek" };
    const urls = sitemapEntries([a, b]).map((e) => e.url);
    expect(urls).toContain(`${SITE_URL}/pl/poland/christmas-markets/krakow`);
  });
});

describe("singleMarketRedirect", () => {
  const one = [{ city: { slug: "krakow" }, slug: "rynek-glowny" }];
  const two = [...one, { city: { slug: "krakow" }, slug: "maly-rynek" }];

  it("sends a city with one market to that market", () => {
    expect(singleMarketRedirect("/ru/poland/christmas-markets/krakow", one)).toBe(
      "/ru/poland/christmas-markets/krakow/rynek-glowny",
    );
    expect(singleMarketRedirect("/ru/poland/christmas-markets/krakow/", one)).toBe(
      "/ru/poland/christmas-markets/krakow/rynek-glowny",
    );
  });

  it("keeps the city page when there are several markets", () => {
    expect(singleMarketRedirect("/ru/poland/christmas-markets/krakow", two)).toBeNull();
  });

  it("ignores market pages and other paths", () => {
    expect(
      singleMarketRedirect("/ru/poland/christmas-markets/krakow/rynek-glowny", one),
    ).toBeNull();
    expect(singleMarketRedirect("/ru/poland/christmas-markets", one)).toBeNull();
  });
});
