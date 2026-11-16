import type { Metadata } from "next";
import { getFormatter, getLocale, getTranslations } from "next-intl/server";
import Image from "next/image";
import { HeroScene } from "@/components/HeroScene";
import { HERO_IMAGE } from "@/lib/links";
import { MarketsExplorer } from "@/components/explorer/MarketsExplorer";
import type { MarketPin } from "@/components/explorer/types";
import { markets } from "@/data/markets";
import { calendarDate } from "@/lib/dates";
import { MARKETS_PATH, marketPath } from "@/lib/paths";
import { alternatesFor } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [t, locale] = await Promise.all([getTranslations("Metadata"), getLocale()]);
  return {
    title: { absolute: `${t("marketsTitle")} · ${t("siteName")}` },
    description: t("marketsDescription"),
    alternates: alternatesFor(MARKETS_PATH, locale),
  };
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
    address: m.location.address,
    endShort: format.dateTime(calendarDate(m.season.end), { day: "2-digit", month: "2-digit" }),
    photo: m.photo && {
      src: m.photo.src,
      alt: m.photo.alt[locale],
      source: m.photo.source,
      credit: m.photo.credit,
    },
    dates: format.dateTimeRange(calendarDate(m.season.start), calendarDate(m.season.end), {
      dateStyle: "long",
    }),
    startDay: format.dateTime(calendarDate(m.season.start), { day: "numeric" }),
    startMonth: format.dateTime(calendarDate(m.season.start), { month: "short" }),
    verified: m.verified,
    schedule: {
      season: m.season,
      openingHours: m.openingHours,
      hoursExceptions: m.hoursExceptions,
    },
  }));

  return (
    <>
      <div className="hero-backdrop" aria-hidden="true">
        {HERO_IMAGE ? (
          <Image
            src={HERO_IMAGE}
            alt=""
            fill
            priority
            sizes="100vw"
            className="hero-backdrop__img"
          />
        ) : (
          <HeroScene id="hero" />
        )}
      </div>
      <div className="page-intro">
        <h1>{t("title")}</h1>
        <p className="lead">{t("intro")}</p>
      </div>
      {pins.length > 0 ? <MarketsExplorer pins={pins} /> : <p>{t("empty")}</p>}
    </>
  );
}
