import { describe, expect, it } from "vitest";
import { calendarDate, weekdayDate, weekdayRanges } from "@/lib/dates";

describe("date helpers", () => {
  it("keeps the calendar day when formatted in Europe/Warsaw (winter and summer time)", () => {
    const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Warsaw" });
    for (const iso of ["2026-01-01", "2026-03-29", "2026-10-25", "2026-12-24"]) {
      expect(fmt.format(calendarDate(iso))).toBe(iso);
    }
  });

  it("maps weekday numbers 1–7 to Monday–Sunday", () => {
    const fmt = new Intl.DateTimeFormat("en", { weekday: "long", timeZone: "Europe/Warsaw" });
    expect(fmt.format(weekdayDate(1))).toBe("Monday");
    expect(fmt.format(weekdayDate(7))).toBe("Sunday");
  });

  it("groups consecutive weekdays into ranges", () => {
    expect(weekdayRanges([1, 2, 3, 4, 5, 6, 7])).toEqual([[1, 7]]);
    expect(weekdayRanges([6, 7, 1])).toEqual([
      [1, 1],
      [6, 7],
    ]);
    expect(weekdayRanges([1, 2, 3, 5])).toEqual([
      [1, 3],
      [5, 5],
    ]);
  });
});
