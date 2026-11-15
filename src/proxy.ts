import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { markets } from "./data/markets";
import { routing } from "./i18n/routing";
import { isUnknownMarketPath } from "./lib/known-paths";

// Next 16 renamed `middleware.ts` to `proxy.ts`. next-intl adds the language
// prefix: `/` → `/{lang}` from Accept-Language (default `en`), no cookie.
const handleI18n = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (isUnknownMarketPath(pathname, markets)) {
    // Rewrite to the catch-all route, which calls notFound() before any
    // streaming, so the response is a real 404 with the localized page.
    const locale = pathname.split("/")[1];
    return NextResponse.rewrite(new URL(`/${locale}/not-found`, request.url));
  }
  return handleI18n(request);
}

export const config = {
  // Everything except API routes, Next internals and files with an extension.
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
