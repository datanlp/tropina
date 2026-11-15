import type { Metadata } from "next";
import { getFormatter, getLocale, getTranslations } from "next-intl/server";
import { MarketsExplorer } from "@/components/explorer/MarketsExplorer";
import type { MarketPin } from "@/components/explorer/types";
import { markets } from "@/data/markets";
import { calendarDate } from "@/lib/dates";
import { marketPath } from "@/lib/paths";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  return { title: { absolute: `${t("marketsTitle")} · ${t("siteName")}` } };
}

export default async function MarketsPage() {
  const [t, format, locale] = await Promise.all([
    getTranslations("MarketsPage"),
    getFormatter(),
    getLocale(),
  ]);

  const pins: MarketPin[] = markets.map((m) => ({
    id: m.id,
    name: m.name[locale],
    city: m.city.name[locale],
    href: marketPath(m),
    lat: m.location.lat,
    lng: m.location.lng,
    dates: format.dateTimeRange(calendarDate(m.season.start), calendarDate(m.season.end), {
      dateStyle: "long",
    }),
    verified: m.verified,
    schedule: {
      season: m.season,
      openingHours: m.openingHours,
      hoursExceptions: m.hoursExceptions,
    },
  }));

  return (
    <>
      <h1>{t("title")}</h1>
      <p className="lead">{t("intro")}</p>
      {pins.length > 0 ? <MarketsExplorer pins={pins} /> : <p>{t("empty")}</p>}
    </>
  );
}
