import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { locale as rootLocale } from "next/root-params";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { MARKETS_PATH } from "@/lib/paths";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  return {
    metadataBase: new URL("https://tropina.app"),
    title: { default: t("marketsTitle"), template: `%s · ${t("siteName")}` },
    description: t("marketsDescription"),
  };
}

export default async function LocaleLayout({ children }: LayoutProps<"/[locale]">) {
  const locale = await rootLocale();
  const t = await getTranslations("Layout");

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>
          <a className="skip-link" href="#main">
            {t("skipToContent")}
          </a>
          <header className="site-header">
            <Link href={MARKETS_PATH} className="site-header__home" aria-label={t("homeLink")}>
              Tropina
            </Link>
            <LocaleSwitcher />
          </header>
          <main id="main" tabIndex={-1}>
            {children}
          </main>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
