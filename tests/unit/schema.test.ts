import { describe, expect, it } from "vitest";
import { marketListSchema, marketSchema } from "@/data/schema";
import { validMarket } from "./fixtures";

function parse(value: unknown) {
  return marketSchema.safeParse(value);
}

describe("market schema", () => {
  it("accepts a complete market", () => {
    expect(parse(validMarket()).success).toBe(true);
  });

  it.each(["en", "pl", "ru", "uk"] as const)(
    "rejects a market without the %s translation of its name",
    (lang) => {
      const m = validMarket();
      const name: Record<string, string> = { ...m.name };
      delete name[lang];
      expect(parse({ ...m, name }).success).toBe(false);
    },
  );

  it.each(["en", "pl", "ru", "uk"] as const)("rejects an empty %s translation", (lang) => {
    const m = validMarket();
    expect(parse({ ...m, description: { ...m.description, [lang]: "  " } }).success).toBe(false);
  });

  it("rejects a missing translation inside nested fields (food, city)", () => {
    const m = validMarket();
    const food = [{ name: { en: "x", pl: "x", ru: "x" } }];
    expect(parse({ ...m, food }).success).toBe(false);
    const city = { ...m.city, name: { en: "x", pl: "x", ru: "x" } };
    expect(parse({ ...m, city }).success).toBe(false);
  });

  it("rejects a market without season dates", () => {
    const { season: _season, ...rest } = validMarket();
    expect(parse(rest).success).toBe(false);
  });

  it("rejects invalid or reversed season dates", () => {
    const m = validMarket();
    expect(parse({ ...m, season: { start: "28.11.2026", end: "2026-12-26" } }).success).toBe(false);
    expect(parse({ ...m, season: { start: "2026-02-30", end: "2026-12-26" } }).success).toBe(false);
    expect(parse({ ...m, season: { start: "2026-12-27", end: "2026-12-26" } }).success).toBe(false);
  });

  it("rejects a market without an official URL", () => {
    const { officialUrl: _url, ...rest } = validMarket();
    expect(parse(rest).success).toBe(false);
    expect(parse({ ...validMarket(), officialUrl: "not a url" }).success).toBe(false);
    expect(parse({ ...validMarket(), officialUrl: "javascript:alert(1)" }).success).toBe(false);
  });

  it("rejects a market without coordinates or with coordinates out of range", () => {
    const m = validMarket();
    const { location: _location, ...rest } = m;
    expect(parse(rest).success).toBe(false);
    expect(parse({ ...m, location: { ...m.location, lat: 91 } }).success).toBe(false);
    expect(parse({ ...m, location: { ...m.location, lng: -181 } }).success).toBe(false);
  });

  it("rejects slugs with diacritics, capitals or spaces", () => {
    const m = validMarket();
    expect(parse({ ...m, slug: "rynek-główny", id: "krakow-rynek-główny" }).success).toBe(false);
    expect(
      parse({ ...m, city: { ...m.city, slug: "Krakow" }, id: "Krakow-rynek-glowny" }).success,
    ).toBe(false);
  });

  it("requires id to be {city}-{market}", () => {
    expect(parse({ ...validMarket(), id: "something-else" }).success).toBe(false);
  });

  it("rejects malformed opening hours", () => {
    const m = validMarket();
    expect(
      parse({ ...m, openingHours: [{ days: [0], open: "10:00", close: "21:00" }] }).success,
    ).toBe(false);
    expect(
      parse({ ...m, openingHours: [{ days: [1], open: "25:00", close: "21:00" }] }).success,
    ).toBe(false);
    expect(
      parse({ ...m, openingHours: [{ days: [], open: "10:00", close: "21:00" }] }).success,
    ).toBe(false);
  });

  it("rejects duplicate market ids in a list", () => {
    expect(marketListSchema.safeParse([validMarket(), validMarket()]).success).toBe(false);
  });
});
