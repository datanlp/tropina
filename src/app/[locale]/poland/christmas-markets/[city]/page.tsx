import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { MarketList } from "@/components/MarketList";
import { findCity, getCities } from "@/data/markets";
import { Link } from "@/i18n/navigation";
import { MARKETS_PATH, cityPath } from "@/lib/paths";
import { alternatesFor } from "@/lib/seo";
import { staticParamsOrPlaceholder } from "@/lib/static-params";

export function generateStaticParams() {
  return staticParamsOrPlaceholder(
    getCities().map((c) => ({ city: c.slug })),
    ["city"],
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/poland/christmas-markets/[city]">): Promise<Metadata> {
  const city = findCity((await params).city);
  if (!city) return {};
  const [t, locale] = await Promise.all([getTranslations("CityPage"), getLocale()]);
  return {
    title: t("title", { city: city.name[locale] }),
    alternates: alternatesFor(cityPath(city.slug), locale),
  };
}

export default async function CityPage({
  params,
}: PageProps<"/[locale]/poland/christmas-markets/[city]">) {
  const city = findCity((await params).city);
  if (!city) notFound();
  const [t, locale] = await Promise.all([getTranslations("CityPage"), getLocale()]);

  return (
    <>
      <p>
        <Link href={MARKETS_PATH}>{t("back")}</Link>
      </p>
      <h1>{t("title", { city: city.name[locale] })}</h1>
      <MarketList markets={city.markets} showCity={false} />
    </>
  );
}
