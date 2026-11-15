import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "pl", "ru", "uk"],
  defaultLocale: "en",
  localePrefix: "always",
  // No cookies anywhere in Tropina: the language comes from the URL, and `/`
  // falls back to the browser's Accept-Language header.
  localeCookie: false,
});

export type Locale = (typeof routing.locales)[number];
