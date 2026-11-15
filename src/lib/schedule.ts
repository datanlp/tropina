import type { Market } from "@/data/schema";

/**
 * Opening-time logic. Everything is evaluated in Europe/Warsaw wall-clock
 * time; dates in the data are Warsaw calendar dates (YYYY-MM-DD).
 */
export const TIME_ZONE = "Europe/Warsaw";

export type Schedule = Pick<Market, "season" | "openingHours" | "hoursExceptions">;

const parts = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export type WarsawDay = {
  /** YYYY-MM-DD in Warsaw. */
  date: string;
  /** 1 = Monday … 7 = Sunday. */
  weekday: number;
  /** Minutes since local midnight. */
  minutes: number;
};

export function warsawDay(now: Date): WarsawDay {
  const p = Object.fromEntries(parts.formatToParts(now).map((x) => [x.type, x.value]));
  const date = `${p.year}-${p.month}-${p.day}`;
  return { date, weekday: weekdayOf(date), minutes: Number(p.hour) * 60 + Number(p.minute) };
}

/** Weekday of a calendar date, 1 = Monday. */
function weekdayOf(date: string): number {
  const d = new Date(`${date}T12:00:00Z`).getUTCDay(); // 0 = Sunday
  return d === 0 ? 7 : d;
}

function addDays(date: string, n: number): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

type Interval = { open: number; close: number };

/** Opening intervals that start on `date` (close may be past midnight: close <= open). */
function intervalsFor(s: Schedule, date: string): Interval[] {
  if (date < s.season.start || date > s.season.end) return [];
  const exception = s.hoursExceptions?.find((e) => e.date === date);
  if (exception) {
    if ("closed" in exception) return [];
    return [{ open: toMinutes(exception.open), close: toMinutes(exception.close) }];
  }
  const weekday = weekdayOf(date);
  return s.openingHours
    .filter((h) => (h.days as number[]).includes(weekday))
    .map((h) => ({ open: toMinutes(h.open), close: toMinutes(h.close) }));
}

const crossesMidnight = (i: Interval) => i.close <= i.open;

export function isOpenAt(s: Schedule, now: Date): boolean {
  const { date, minutes } = warsawDay(now);
  const today = intervalsFor(s, date).some((i) =>
    crossesMidnight(i) ? minutes >= i.open : minutes >= i.open && minutes < i.close,
  );
  if (today) return true;
  // Still open from yesterday's late shift.
  return intervalsFor(s, addDays(date, -1)).some((i) => crossesMidnight(i) && minutes < i.close);
}

/** The Saturday and Sunday ahead (today included); only Sunday when today is Sunday. */
export function upcomingWeekend(now: Date): string[] {
  const { date, weekday } = warsawDay(now);
  if (weekday === 7) return [date];
  const saturday = addDays(date, 6 - weekday);
  return [saturday, addDays(saturday, 1)];
}

export function isOpenOnWeekend(s: Schedule, now: Date): boolean {
  return upcomingWeekend(now).some((d) => intervalsFor(s, d).length > 0);
}

export function isSeasonOver(s: Schedule, now: Date): boolean {
  return warsawDay(now).date > s.season.end && !isOpenAt(s, now);
}

export type MarketFilter = "open-now" | "weekend" | "all";

export function matchesFilter(s: Schedule, filter: MarketFilter, now: Date): boolean {
  if (isSeasonOver(s, now)) return false;
  if (filter === "open-now") return isOpenAt(s, now);
  if (filter === "weekend") return isOpenOnWeekend(s, now);
  return true;
}
