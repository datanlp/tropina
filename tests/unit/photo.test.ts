import { describe, expect, it } from "vitest";
import { marketSchema } from "@/data/schema";
import { validMarket } from "./fixtures";

const alt = { en: "Stalls at night", pl: "Stragany nocą", ru: "Ларьки ночью", uk: "Ятки вночі" };

describe("market photo", () => {
  it("is optional", () => {
    expect(marketSchema.safeParse(validMarket()).success).toBe(true);
  });

  it("accepts a local AI-generated photo with alt text in every language", () => {
    const photo = { src: "/photos/krakow-rynek-glowny.webp", alt, source: "ai" };
    expect(marketSchema.safeParse({ ...validMarket(), photo }).success).toBe(true);
  });

  it("must say where the photo comes from (ai, official or user)", () => {
    const photo = { src: "/photos/x.webp", alt };
    expect(marketSchema.safeParse({ ...validMarket(), photo }).success).toBe(false);
    const bad = { src: "/photos/x.webp", alt, source: "stock" };
    expect(marketSchema.safeParse({ ...validMarket(), photo: bad }).success).toBe(false);
  });

  it("needs alt text in all four languages", () => {
    const photo = { src: "/photos/x.webp", alt: { en: "x", pl: "x", ru: "x" }, source: "ai" };
    expect(marketSchema.safeParse({ ...validMarket(), photo }).success).toBe(false);
  });

  it("is served from the site itself, not hot-linked", () => {
    const photo = { src: "https://example.com/x.jpg", alt, source: "official" };
    expect(marketSchema.safeParse({ ...validMarket(), photo }).success).toBe(false);
  });

  it("a user photo names its author", () => {
    const photo = { src: "/photos/x.webp", alt, source: "user" };
    expect(marketSchema.safeParse({ ...validMarket(), photo }).success).toBe(false);
    const credited = { ...photo, credit: "@anna" };
    expect(marketSchema.safeParse({ ...validMarket(), photo: credited }).success).toBe(true);
  });
});
