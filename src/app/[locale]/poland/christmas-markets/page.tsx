import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { MarketList } from "@/components/MarketList";
import { markets } from "@/data/markets";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  return { title: { absolute: `${t("marketsTitle")} · ${t("siteName")}` } };
}

export default function MarketsPage() {
  const t = useTranslations("MarketsPage");
  return (
    <>
      <h1>{t("title")}</h1>
      <p className="lead">{t("intro")}</p>
      {markets.length > 0 ? <MarketList markets={markets} /> : <p>{t("empty")}</p>}
    </>
  );
}
