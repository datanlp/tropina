import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Script from "next/script";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { locale as rootLocale } from "next/root-params";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { PwaSetup } from "@/components/pwa/PwaSetup";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { MARKETS_PATH } from "@/lib/paths";
import "../globals.css";

// Self-hosted by next/font at build time: no requests to Google from the browser.
const sans = Inter({ subsets: ["latin", "latin-ext", "cyrillic"], variable: "--font-sans" });
const display = Playfair_Display({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["600", "700"],
  variable: "--font-display",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  return {
    metadataBase: new URL("https://tropina.app"),
    title: { default: t("marketsTitle"), template: `%s · ${t("siteName")}` },
    description: t("marketsDescription"),
    icons: { apple: "/icons/apple-touch-icon.png" },
    appleWebApp: { capable: true, title: t("siteName") },
  };
}

export const viewport: Viewport = { themeColor: "#14392b" };

// Umami Cloud (cookie-free). Without a website id analytics stays off.
const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

export default async function LocaleLayout({ children }: LayoutProps<"/[locale]">) {
  const locale = await rootLocale();
  const t = await getTranslations("Layout");

  return (
    <html lang={locale} className={`${sans.variable} ${display.variable}`}>
      <body>
        <NextIntlClientProvider>
          <a className="skip-link" href="#main">
            {t("skipToContent")}
          </a>
          <header className="site-header">
            <Link href={MARKETS_PATH} className="site-header__home" aria-label={t("homeLink")}>
              <svg className="site-header__mark" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2l2.4 6.9L21.5 9l-5.6 4.4 2 7L12 16.3 6.1 20.4l2-7L2.5 9l7.1-.1z" />
              </svg>
              Tropina
            </Link>
            <LocaleSwitcher />
          </header>
          <main id="main" tabIndex={-1}>
            {children}
          </main>
          <PwaSetup />
        </NextIntlClientProvider>
        {umamiWebsiteId && (
          <Script
            src="https://cloud.umami.is/script.js"
            data-website-id={umamiWebsiteId}
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
