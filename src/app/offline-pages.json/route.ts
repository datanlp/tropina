import { markets } from "@/data/markets";
import { routing } from "@/i18n/routing";
import { MARKETS_PATH, marketPath } from "@/lib/paths";

/**
 * Pages the service worker saves on install so every market card opens
 * offline. City pages are left out: a one-market city answers with a redirect,
 * which a service worker may not use for a navigation.
 */
export function GET() {
  const paths = [MARKETS_PATH, ...markets.map(marketPath)];
  const urls = routing.locales.flatMap((locale) => paths.map((p) => `/${locale}${p}`));
  return Response.json(urls);
}
