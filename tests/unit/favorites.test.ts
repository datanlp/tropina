import { describe, expect, it } from "vitest";
import { parseFavorites, toggleFavorite } from "@/lib/favorites";

describe("favourites", () => {
  it("reads a stored list of market ids", () => {
    expect(parseFavorites('["krakow-rynek","wroclaw-rynek"]')).toEqual([
      "krakow-rynek",
      "wroclaw-rynek",
    ]);
  });

  it("treats missing or broken storage as no favourites", () => {
    expect(parseFavorites(null)).toEqual([]);
    expect(parseFavorites("not json")).toEqual([]);
    expect(parseFavorites('{"a":1}')).toEqual([]);
    expect(parseFavorites('[1, "ok", null]')).toEqual(["ok"]);
  });

  it("adds a market that is not a favourite yet", () => {
    expect(toggleFavorite(["a"], "b")).toEqual(["a", "b"]);
  });

  it("removes a market that already is one", () => {
    expect(toggleFavorite(["a", "b"], "a")).toEqual(["b"]);
  });
});
