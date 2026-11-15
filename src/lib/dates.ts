/**
 * Data stores calendar dates as `YYYY-MM-DD` in Europe/Warsaw. Noon UTC falls
 * on the same calendar day in Warsaw all year, so formatting it with
 * timeZone "Europe/Warsaw" never shifts the day.
 */
export function calendarDate(iso: string): Date {
  return new Date(`${iso}T12:00:00Z`);
}

/** 2024-01-01 was a Monday; weekday n (1 = Monday) is n-1 days later. */
export function weekdayDate(day: number): Date {
  return new Date(Date.UTC(2024, 0, day, 12));
}

/** [1,2,3,5,6] → [[1,3],[5,6]]: consecutive weekdays grouped into ranges. */
export function weekdayRanges(days: readonly number[]): [number, number][] {
  const sorted = [...new Set(days)].sort((a, b) => a - b);
  const ranges: [number, number][] = [];
  for (const d of sorted) {
    const last = ranges.at(-1);
    if (last && d === last[1] + 1) last[1] = d;
    else ranges.push([d, d]);
  }
  return ranges;
}
