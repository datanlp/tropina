import type { Market } from "@/data/schema";

/** Permanent URLs (without the language prefix). No year in the path. */
export const MARKETS_PATH = "/poland/christmas-markets";

export function cityPath(citySlug: string): string {
  return `${MARKETS_PATH}/${citySlug}`;
}

export function marketPath(m: Pick<Market, "slug" | "city">): string {
  return `${cityPath(m.city.slug)}/${m.slug}`;
}
