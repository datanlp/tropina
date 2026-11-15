import { afterEach, describe, expect, it, vi } from "vitest";
import { setAnalyticsProvider, track } from "@/lib/analytics";

afterEach(() => setAnalyticsProvider(null));

describe("track", () => {
  it("sends the event and props to the current provider", () => {
    const send = vi.fn();
    setAnalyticsProvider({ send });
    track("market_open", { market: "krakow-rynek-glowny" });
    expect(send).toHaveBeenCalledWith("market_open", { market: "krakow-rynek-glowny" });
  });

  it("does nothing (and does not throw) without a provider", () => {
    expect(() => track("filter_change", { filter: "open-now" })).not.toThrow();
  });

  it("never lets a provider error break the page", () => {
    setAnalyticsProvider({
      send: () => {
        throw new Error("blocked by an ad blocker");
      },
    });
    expect(() => track("lang_change", { from: "en", to: "pl" })).not.toThrow();
  });
});
