import { describe, expect, it } from "vitest";
import {
  isOpenAt,
  isOpenOnWeekend,
  isSeasonOver,
  upcomingWeekend,
  warsawDay,
  type Schedule,
} from "@/lib/schedule";

/** Warsaw wall-clock time → Date. Offset: +01:00 in winter, +02:00 in summer. */
const at = (local: string, offset = "+01:00") => new Date(`${local}${offset}`);

const daily: Schedule = {
  season: { start: "2026-11-28", end: "2026-12-26" },
  openingHours: [{ days: [1, 2, 3, 4, 5, 6, 7], open: "10:00", close: "21:00" }],
  hoursExceptions: [
    { date: "2026-12-24", open: "10:00", close: "14:00" },
    { date: "2026-12-25", closed: true },
  ],
};

describe("warsawDay", () => {
  it("uses Warsaw local date, not UTC", () => {
    // 23:30 UTC on 30 Nov is already 1 Dec in Warsaw (UTC+1).
    expect(warsawDay(new Date("2026-11-30T23:30:00Z"))).toMatchObject({
      date: "2026-12-01",
      weekday: 2,
      minutes: 30,
    });
  });

  it("handles summer time (UTC+2)", () => {
    expect(warsawDay(new Date("2026-07-01T22:30:00Z"))).toMatchObject({
      date: "2026-07-02",
      minutes: 30,
    });
  });
});

describe("isOpenAt", () => {
  it("is open inside opening hours during the season", () => {
    expect(isOpenAt(daily, at("2026-12-01T12:00:00"))).toBe(true);
  });

  it("is closed before opening and at closing time", () => {
    expect(isOpenAt(daily, at("2026-12-01T09:59:00"))).toBe(false);
    expect(isOpenAt(daily, at("2026-12-01T21:00:00"))).toBe(false);
  });

  it("is closed before the season starts and after it ends", () => {
    expect(isOpenAt(daily, at("2026-11-27T12:00:00"))).toBe(false);
    expect(isOpenAt(daily, at("2026-12-27T12:00:00"))).toBe(false);
  });

  it("respects day-of-week rules", () => {
    const weekdays: Schedule = {
      ...daily,
      openingHours: [{ days: [1, 2, 3, 4, 5], open: "10:00", close: "21:00" }],
    };
    // 2026-12-05 is a Saturday.
    expect(isOpenAt(weekdays, at("2026-12-05T12:00:00"))).toBe(false);
    expect(isOpenAt(weekdays, at("2026-12-04T12:00:00"))).toBe(true);
  });

  it("applies 24 and 25 December exceptions", () => {
    expect(isOpenAt(daily, at("2026-12-24T13:00:00"))).toBe(true);
    expect(isOpenAt(daily, at("2026-12-24T15:00:00"))).toBe(false);
    expect(isOpenAt(daily, at("2026-12-25T12:00:00"))).toBe(false);
    expect(isOpenAt(daily, at("2026-12-26T12:00:00"))).toBe(true);
  });

  it("handles hours that cross midnight", () => {
    const late: Schedule = {
      season: { start: "2026-12-01", end: "2026-12-31" },
      openingHours: [{ days: [5, 6], open: "18:00", close: "01:00" }],
    };
    // Friday 4 Dec 23:30 → open; Saturday 00:30 → still open from Friday.
    expect(isOpenAt(late, at("2026-12-04T23:30:00"))).toBe(true);
    expect(isOpenAt(late, at("2026-12-05T00:30:00"))).toBe(true);
    expect(isOpenAt(late, at("2026-12-05T01:00:00"))).toBe(false);
    // Thursday night → Friday 00:30: Thursday is not an opening day.
    expect(isOpenAt(late, at("2026-12-04T00:30:00"))).toBe(false);
    // Last night of the season runs past midnight into 1 January.
    const nye: Schedule = { ...late, openingHours: [{ days: [4], open: "18:00", close: "02:00" }] };
    expect(isOpenAt(nye, at("2027-01-01T01:00:00"))).toBe(true);
  });

  it("works across the DST change (last Sunday of March)", () => {
    const spring: Schedule = {
      season: { start: "2027-03-27", end: "2027-03-29" },
      openingHours: [{ days: [7], open: "10:00", close: "18:00" }],
    };
    // 28 Mar 2027 is a Sunday; 12:00 local is UTC+2 after the switch.
    expect(isOpenAt(spring, at("2027-03-28T12:00:00", "+02:00"))).toBe(true);
    expect(isOpenAt(spring, new Date("2027-03-28T16:30:00Z"))).toBe(false); // 18:30 local
  });
});

describe("upcomingWeekend", () => {
  it("is the next Saturday and Sunday on a weekday", () => {
    expect(upcomingWeekend(at("2026-12-02T12:00:00"))).toEqual(["2026-12-05", "2026-12-06"]);
  });
  it("includes today on Saturday", () => {
    expect(upcomingWeekend(at("2026-12-05T12:00:00"))).toEqual(["2026-12-05", "2026-12-06"]);
  });
  it("is only today on Sunday", () => {
    expect(upcomingWeekend(at("2026-12-06T12:00:00"))).toEqual(["2026-12-06"]);
  });
});

describe("isOpenOnWeekend", () => {
  it("is true when open on Saturday or Sunday of the coming weekend", () => {
    expect(isOpenOnWeekend(daily, at("2026-12-02T12:00:00"))).toBe(true);
  });
  it("is false when the season starts after the weekend", () => {
    expect(isOpenOnWeekend(daily, at("2026-11-18T12:00:00"))).toBe(false);
  });
  it("is false for weekday-only markets", () => {
    const weekdays: Schedule = {
      ...daily,
      openingHours: [{ days: [1, 2, 3, 4, 5], open: "10:00", close: "21:00" }],
    };
    expect(isOpenOnWeekend(weekdays, at("2026-12-02T12:00:00"))).toBe(false);
  });
  it("respects closed exceptions on the weekend", () => {
    const sat: Schedule = {
      season: { start: "2026-12-01", end: "2026-12-31" },
      openingHours: [{ days: [6], open: "10:00", close: "20:00" }],
      hoursExceptions: [{ date: "2026-12-05", closed: true }],
    };
    expect(isOpenOnWeekend(sat, at("2026-12-02T12:00:00"))).toBe(false);
  });
});

describe("isSeasonOver", () => {
  it("is false during and before the season", () => {
    expect(isSeasonOver(daily, at("2026-11-01T12:00:00"))).toBe(false);
    expect(isSeasonOver(daily, at("2026-12-26T20:00:00"))).toBe(false);
  });
  it("is true from the day after the last day (Warsaw time)", () => {
    expect(isSeasonOver(daily, at("2026-12-27T00:00:00"))).toBe(true);
    // 26 Dec 23:30 UTC is 27 Dec 00:30 in Warsaw.
    expect(isSeasonOver(daily, new Date("2026-12-26T23:30:00Z"))).toBe(true);
  });
});
