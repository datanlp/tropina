import { describe, expect, it } from "vitest";
import { loadMarkets } from "@/data/markets";

describe("market data", () => {
  it("excludes TEST records from the production data set", () => {
    const prod = loadMarkets({ includeTest: false });
    expect(prod.some((m) => m.id.includes("test"))).toBe(false);
    expect(prod.some((m) => m.name.en.includes("TEST"))).toBe(false);
  });

  it("includes exactly two TEST records when asked to", () => {
    const all = loadMarkets({ includeTest: true });
    const test = all.filter((m) => m.name.en.startsWith("TEST"));
    expect(test).toHaveLength(2);
  });

  it("marks every TEST record as TEST in every language", () => {
    const test = loadMarkets({ includeTest: true }).filter((m) => m.id.includes("test"));
    for (const m of test) {
      for (const text of Object.values(m.name)) expect(text).toMatch(/^TEST/);
    }
  });
});
