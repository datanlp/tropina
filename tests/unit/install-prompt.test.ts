import { describe, expect, it } from "vitest";
import { installPlatform, shouldOfferInstall } from "@/lib/install";

describe("shouldOfferInstall", () => {
  it("waits for the second market card", () => {
    expect(shouldOfferInstall({ cardsOpened: 1, dismissed: false, standalone: false })).toBe(false);
    expect(shouldOfferInstall({ cardsOpened: 2, dismissed: false, standalone: false })).toBe(true);
  });
  it("never shows once dismissed or when already installed", () => {
    expect(shouldOfferInstall({ cardsOpened: 5, dismissed: true, standalone: false })).toBe(false);
    expect(shouldOfferInstall({ cardsOpened: 5, dismissed: false, standalone: true })).toBe(false);
  });
});

describe("installPlatform", () => {
  it("detects iOS Safari (including iPadOS that says Macintosh)", () => {
    const iphone =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
    expect(installPlatform(iphone, 5)).toBe("ios");
    const ipad =
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15";
    expect(installPlatform(ipad, 5)).toBe("ios");
    expect(installPlatform(ipad, 0)).toBe("other"); // a real Mac has no touch points
  });
  it("treats everything else as a browser with a native prompt or none", () => {
    const android =
      "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36";
    expect(installPlatform(android, 5)).toBe("other");
  });
});
