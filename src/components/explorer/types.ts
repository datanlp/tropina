import type { Schedule } from "@/lib/schedule";

/** What the client map and list need about a market: small and already localized. */
export type MarketPin = {
  id: string;
  name: string;
  city: string;
  /** Path without the language prefix, e.g. /poland/christmas-markets/krakow/x */
  href: string;
  lat: number;
  lng: number;
  address: string;
  /** Full localized range, e.g. "28 November – 26 December 2026". */
  dates: string;
  /** Short last day for map labels, e.g. "26.12". */
  endShort: string;
  /** Start date split for the calendar stamp, e.g. "28" + "Nov". */
  startDay: string;
  startMonth: string;
  verified: boolean;
  schedule: Schedule;
  photo?: {
    src: string;
    alt: string;
    source: "ai" | "official" | "user";
    credit?: string;
  };
};
