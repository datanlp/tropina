import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { locale as rootLocale } from "next/root-params";
import { notFound } from "next/navigation";
import { routing } from "./routing";

export const TIME_ZONE = "Europe/Warsaw";

export default getRequestConfig(async () => {
  // The locale is the root route param `[locale]` (next/root-params), so
  // pages stay statically rendered with Cache Components.
  const locale = await rootLocale();
  if (!hasLocale(routing.locales, locale)) notFound();

  return {
    locale,
    timeZone: TIME_ZONE,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
