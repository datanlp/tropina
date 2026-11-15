import { describe, expect, it } from "vitest";
import { isUnknownMarketPath } from "@/lib/known-paths";

const markets = [{ city: { slug: "krakow" }, slug: "rynek-glowny" }];

describe("isUnknownMarketPath", () => {
  it("accepts the list, known cities and known markets", () => {
    expect(isUnknownMarketPath("/en/poland/christmas-markets", markets)).toBe(false);
    expect(isUnknownMarketPath("/pl/poland/christmas-markets/krakow", markets)).toBe(false);
    expect(isUnknownMarketPath("/uk/poland/christmas-markets/krakow/rynek-glowny", markets)).toBe(
      false,
    );
    expect(isUnknownMarketPath("/uk/poland/christmas-markets/krakow/rynek-glowny/", markets)).toBe(
      false,
    );
  });

  it("flags unknown cities and markets", () => {
    expect(isUnknownMarketPath("/en/poland/christmas-markets/gdansk", markets)).toBe(true);
    expect(isUnknownMarketPath("/en/poland/christmas-markets/krakow/nope", markets)).toBe(true);
    expect(isUnknownMarketPath("/en/poland/christmas-markets/__none__", [])).toBe(true);
  });

  it("ignores paths outside the markets section", () => {
    expect(isUnknownMarketPath("/", markets)).toBe(false);
    expect(isUnknownMarketPath("/en", markets)).toBe(false);
    expect(isUnknownMarketPath("/en/something", markets)).toBe(false);
  });
});
