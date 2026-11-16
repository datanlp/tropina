import type { Metadata } from "next";
import { getFormatter, getLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { SeasonDates } from "@/components/SeasonDates";
import { SeasonStatus } from "@/components/SeasonStatus";
import { TrackedLink } from "@/components/TrackedLink";
import { VerificationBadge } from "@/components/VerificationBadge";
import { MarketVisit } from "@/components/pwa/MarketVisit";
import { rememberCardScript } from "@/components/pwa/install-state";
import { findMarket, markets } from "@/data/markets";
import { Link } from "@/i18n/navigation";
import { calendarDate, weekdayDate, weekdayRanges } from "@/lib/dates";
import { directionsUrl } from "@/lib/directions";
import { cityPath, marketPath } from "@/lib/paths";
import { alternatesFor, jsonLdScript, marketEventJsonLd } from "@/lib/seo";
import { staticParamsOrPlaceholder } from "@/lib/static-params";

type Props = PageProps<"/[locale]/poland/christmas-markets/[city]/[market]">;

export function generateStaticParams() {
  return staticParamsOrPlaceholder(
    markets.map((m) => ({ city: m.city.slug, market: m.slug })),
    ["city", "market"],
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city, market } = await params;
  const m = findMarket(city, market);
  if (!m) return {};
  const locale = await getLocale();
  return {
    title: m.name[locale],
    description: m.description[locale],
    alternates: alternatesFor(marketPath(m), locale),
    openGraph: {
      title: m.name[locale],
      description: m.description[locale],
      url: alternatesFor(marketPath(m), locale).canonical,
      siteName: "Tropina",
      locale,
      type: "website",
    },
  };
}

export default async function MarketPage({ params }: Props) {
  const { city, market } = await params;
  const m = findMarket(city, market);
  if (!m) notFound();

  const [t, format, locale] = await Promise.all([
    getTranslations("MarketPage"),
    getFormatter(),
    getLocale(),
  ]);

  const weekday = (d: number) => format.dateTime(weekdayDate(d), { weekday: "short" });
  const days = (list: readonly number[]) =>
    weekdayRanges(list)
      .map(([a, b]) => (a === b ? weekday(a) : `${weekday(a)}–${weekday(b)}`))
      .join(", ");

  return (
    <article className="market-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(marketEventJsonLd(m, locale)) }}
      />
      <p>
        <Link href={cityPath(m.city.slug)}>{t("back", { city: m.city.name[locale] })}</Link>
      </p>
      <h1>{m.name[locale]}</h1>
      <p className="lead">{m.description[locale]}</p>

      <SeasonStatus
        schedule={{
          season: m.season,
          openingHours: m.openingHours,
          hoursExceptions: m.hoursExceptions,
        }}
      />

      <h2>{t("dates")}</h2>
      <p>
        <SeasonDates season={m.season} />
      </p>
      <VerificationBadge verified={m.verified} />
      <p className="muted">
        {t("lastChecked", {
          date: format.dateTime(calendarDate(m.lastChecked), { dateStyle: "long" }),
        })}
      </p>

      <h2>{t("hours")}</h2>
      <ul>
        {m.openingHours.map((h, i) => (
          <li key={i}>{t("hoursRow", { days: days(h.days), open: h.open, close: h.close })}</li>
        ))}
      </ul>
      {m.hoursNote && <p>{m.hoursNote[locale]}</p>}

      {m.food.length > 0 && (
        <>
          <h2>{t("food")}</h2>
          <ul>
            {m.food.map((f, i) => (
              <li key={i}>
                {f.name[locale]}
                {f.note && <>: {f.note[locale]}</>}
              </li>
            ))}
          </ul>
        </>
      )}

      {m.transport && (
        <>
          <h2>{t("transport")}</h2>
          <p>{m.transport[locale]}</p>
        </>
      )}

      {m.accessibility && (
        <>
          <h2>{t("accessibility")}</h2>
          <p>{m.accessibility[locale]}</p>
        </>
      )}

      <p className="actions">
        <TrackedLink
          className="button"
          href={directionsUrl(m.location)}
          rel="noopener"
          event="directions_click"
          props={{ market: m.id }}
        >
          {t("directions")}
        </TrackedLink>
        <TrackedLink
          className="button button--secondary"
          href={m.officialUrl}
          rel="noopener"
          event="official_link_click"
          props={{ market: m.id }}
        >
          {t("officialSite")}
        </TrackedLink>
      </p>
      <p className="muted">{m.location.address}</p>

      {m.suggestedBy && <p className="muted">{t("suggestedBy", { nick: m.suggestedBy })}</p>}

      <script dangerouslySetInnerHTML={{ __html: rememberCardScript(m.id) }} />
      <MarketVisit marketId={m.id} />
    </article>
  );
}
