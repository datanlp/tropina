"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { track } from "@/lib/analytics";

export function LocaleSwitcher() {
  const t = useTranslations("LocaleSwitcher");
  const current = useLocale();
  const pathname = usePathname();

  return (
    <nav aria-label={t("label")} className="locale-switcher">
      <ul>
        {routing.locales.map((locale) => (
          <li key={locale}>
            <Link
              href={pathname}
              locale={locale}
              lang={locale}
              hrefLang={locale}
              aria-current={locale === current ? "true" : undefined}
              onClick={() => {
                if (locale !== current) track("lang_change", { from: current, to: locale });
              }}
            >
              {/* Phones show the short code; the full name stays in the link's name. */}
              <span className="locale-switcher__code">{locale.toUpperCase()}</span>
              <span className="locale-switcher__name">{t(`names.${locale}`)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
