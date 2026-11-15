import { redirect } from "@/i18n/navigation";
import { locale as rootLocale } from "next/root-params";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { MARKETS_PATH } from "@/lib/paths";

// `/{lang}` will become the home of the big Tropina map. For now the only
// layer is Christmas markets, so send people there.
export default async function LocaleHome() {
  const locale = await rootLocale();
  if (!hasLocale(routing.locales, locale)) notFound();
  redirect({ href: MARKETS_PATH, locale });
}
