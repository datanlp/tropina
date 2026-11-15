"use client";

import { useTranslations } from "next-intl";
import { isOpenAt, isSeasonOver, type Schedule, warsawDay } from "@/lib/schedule";
import { useNow } from "@/lib/use-now";

/** "Open now" / "Closed" / "Season over" for one market, by Warsaw time. */
export function SeasonStatus({ schedule }: { schedule: Schedule }) {
  const t = useTranslations("SeasonStatus");
  const now = useNow();
  if (!now) return null;

  let key: "over" | "upcoming" | "openNow" | "closedNow";
  if (isSeasonOver(schedule, now)) key = "over";
  else if (warsawDay(now).date < schedule.season.start) key = "upcoming";
  else key = isOpenAt(schedule, now) ? "openNow" : "closedNow";

  return (
    <p className={`status status--${key}`} role="status">
      {t(key)}
    </p>
  );
}
