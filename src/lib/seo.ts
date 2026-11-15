import type { MetadataRoute } from "next";
import type { Market } from "@/data/schema";
import { routing, type Locale } from "@/i18n/routing";
import { MARKETS_PATH, cityPath, marketPath } from "@/lib/paths";

export const SITE_URL = "https://tropina.app";

const abs = (locale: Locale, path: string) => `${SITE_URL}/${locale}${path}`;

function languages(path: string): Record<Locale | "x-default", string> {
  const out = Object.fromEntries(routing.locales.map((l) => [l, abs(l, path)])) as Record<
    Locale | "x-default",
    string
  >;
  out["x-default"] = abs(routing.defaultLocale, path);
  return out;
}

/** `alternates` for Next metadata: canonical + hreflang for every language. */
export function alternatesFor(path: string, locale: Locale) {
  return { canonical: abs(locale, path), languages: languages(path) };
}

/** schema.org Event for one market, in the page language. */
export function marketEventJsonLd(m: Market, locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: m.name[locale],
    description: m.description[locale],
    startDate: m.season.start,
    endDate: m.season.end,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    inLanguage: locale,
    isAccessibleForFree: true,
    url: abs(locale, marketPath(m)),
    location: {
      "@type": "Place",
      name: m.city.name[locale],
      address: m.location.address,
      geo: { "@type": "GeoCoordinates", latitude: m.location.lat, longitude: m.location.lng },
    },
  };
}

/** Serialize JSON-LD for a <script> tag without allowing `</script>` injection. */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/**
 * Sitemap: the list page, city pages of cities with several markets (a city
 * with one market only redirects) and every market, each in four languages.
 */
export function sitemapEntries(markets: Market[]): MetadataRoute.Sitemap {
  const paths = [MARKETS_PATH];
  const perCity = new Map<string, number>();
  for (const m of markets) perCity.set(m.city.slug, (perCity.get(m.city.slug) ?? 0) + 1);
  for (const [city, count] of perCity) if (count > 1) paths.push(cityPath(city));
  for (const m of markets) paths.push(marketPath(m));

  return paths.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: abs(locale, path),
      alternates: { languages: languages(path) },
    })),
  );
}
