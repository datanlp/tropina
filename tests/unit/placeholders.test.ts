import { describe, expect, it } from "vitest";
import { loadMarkets } from "@/data/markets";

const CITIES = ["gdansk", "katowice", "krakow", "opole", "poznan", "torun", "warszawa", "wroclaw"];

describe("LOREM placeholder records", () => {
  it("are not in the production data set", () => {
    const prod = loadMarkets({ includeTest: false, includePlaceholders: false });
    expect(prod.some((m) => m.name.en.startsWith("LOREM"))).toBe(false);
  });

  it("are not in the TEST data set used by e2e", () => {
    const e2e = loadMarkets({ includeTest: true, includePlaceholders: false });
    expect(e2e.some((m) => m.name.en.startsWith("LOREM"))).toBe(false);
  });

  it("cover the eight launch cities, one market each", () => {
    const lorem = loadMarkets({ includeTest: false, includePlaceholders: true }).filter((m) =>
      m.name.en.startsWith("LOREM"),
    );
    expect(lorem.map((m) => m.city.slug).sort()).toEqual(CITIES);
  });

  it("say LOREM in every language", () => {
    const lorem = loadMarkets({ includeTest: false, includePlaceholders: true }).filter((m) =>
      m.id.endsWith("-lorem-ipsum"),
    );
    expect(lorem).toHaveLength(8);
    for (const m of lorem) {
      for (const text of Object.values(m.name)) expect(text).toMatch(/^LOREM/);
    }
  });

  it("validate together with the TEST records (no duplicate ids)", () => {
    expect(() => loadMarkets({ includeTest: true, includePlaceholders: true })).not.toThrow();
  });
});
