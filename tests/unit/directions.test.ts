import { describe, expect, it } from "vitest";
import { directionsUrl } from "@/lib/directions";

describe("directionsUrl", () => {
  it("builds a Google Maps directions link to the coordinates", () => {
    expect(directionsUrl({ lat: 50.0617, lng: 19.9373 })).toBe(
      "https://www.google.com/maps/dir/?api=1&destination=50.0617,19.9373",
    );
  });
});
