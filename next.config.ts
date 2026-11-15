import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Inlined at build time into every bundle (pages and proxy alike), so a
  // build either contains the TEST records everywhere or nowhere.
  env: {
    // Versions the service worker's caches: a new build drops the old ones.
    TROPINA_BUILD_ID: Date.now().toString(36),
    TROPINA_INCLUDE_TEST_DATA: process.env.TROPINA_INCLUDE_TEST_DATA === "1" ? "1" : "0",
    TROPINA_INCLUDE_PLACEHOLDER_DATA:
      process.env.TROPINA_INCLUDE_PLACEHOLDER_DATA === "1" ? "1" : "0",
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
