import { useFormatter } from "next-intl";
import type { Market } from "@/data/schema";
import { calendarDate } from "@/lib/dates";

export function SeasonDates({ season }: { season: Market["season"] }) {
  const format = useFormatter();
  return (
    <>{format.dateTimeRange(calendarDate(season.start), calendarDate(season.end), { dateStyle: "long" })}</>
  );
}
