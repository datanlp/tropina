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
