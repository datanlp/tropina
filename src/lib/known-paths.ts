const MARKET_ROUTE = /^\/[a-z]{2}\/poland\/christmas-markets\/([^/]+)(?:\/([^/]+))?\/?$/;

/**
 * True for a city or market URL that has no data. The proxy answers these with
 * a real 404 before rendering starts: with Partial Prerendering a page that
 * calls notFound() after streaming has begun would answer 200 (a soft 404).
 */
export function isUnknownMarketPath(
  pathname: string,
  markets: readonly { slug: string; city: { slug: string } }[],
): boolean {
  const match = MARKET_ROUTE.exec(pathname);
  if (!match) return false;
  const [, city, market] = match;
  return !markets.some((m) => m.city.slug === city && (market === undefined || m.slug === market));
}

const CITY_ROUTE = /^\/([a-z]{2})\/poland\/christmas-markets\/([^/]+)\/?$/;

/** For a city URL whose city has exactly one market: that market's URL. */
export function singleMarketRedirect(
  pathname: string,
  markets: readonly { slug: string; city: { slug: string } }[],
): string | null {
  const match = CITY_ROUTE.exec(pathname);
  if (!match) return null;
  const [, locale, city] = match;
  const inCity = markets.filter((m) => m.city.slug === city);
  if (inCity.length !== 1) return null;
  return `/${locale}/poland/christmas-markets/${city}/${inCity[0].slug}`;
}
