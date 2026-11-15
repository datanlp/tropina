import { type Market, marketListSchema } from "@/data/schema";
import { krakowTestRynekGlowny } from "./test/krakow-test-rynek-glowny";
import { wroclawTestRynek } from "./test/wroclaw-test-rynek";

/** Real, published markets. One file per market next to this one. */
const realMarkets: Market[] = [];

/** TEST records: only in dev, unit and e2e runs (TROPINA_INCLUDE_TEST_DATA=1). */
const testMarkets: Market[] = [krakowTestRynekGlowny, wroclawTestRynek];

/** Validates with zod and throws on any error, so a bad record fails the build. */
export function loadMarkets({ includeTest }: { includeTest: boolean }): Market[] {
  const list = includeTest ? [...realMarkets, ...testMarkets] : realMarkets;
  return marketListSchema.parse(list);
}

export const includeTestData = process.env.TROPINA_INCLUDE_TEST_DATA === "1";

export const markets: Market[] = loadMarkets({ includeTest: includeTestData });

export type City = Market["city"] & { markets: Market[] };

export function getCities(): City[] {
  const bySlug = new Map<string, City>();
  for (const m of markets) {
    const city = bySlug.get(m.city.slug) ?? { ...m.city, markets: [] };
    city.markets.push(m);
    bySlug.set(m.city.slug, city);
  }
  return [...bySlug.values()];
}

export function findCity(slug: string): City | undefined {
  return getCities().find((c) => c.slug === slug);
}

export function findMarket(citySlug: string, marketSlug: string): Market | undefined {
  return markets.find((m) => m.city.slug === citySlug && m.slug === marketSlug);
}
