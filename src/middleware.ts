import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, locales } from "@/content";

// Redirect bare "/" to /es or /en based on Accept-Language.
// Any other path is either already localized (/es/..., /en/...) or an asset.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip assets, API, and already-localized paths.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/oauth") || // OAuth callback is language-agnostic
    pathname.includes(".") ||
    locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))
  ) {
    return NextResponse.next();
  }

  // Parse Accept-Language for the best match.
  const accept = req.headers.get("accept-language") ?? "";
  const primary = accept
    .split(",")
    .map((part) => part.split(";")[0].trim().toLowerCase())
    .find((lang) => locales.some((l) => lang.startsWith(l)));

  const target = primary
    ? locales.find((l) => primary.startsWith(l)) ?? defaultLocale
    : defaultLocale;

  const url = req.nextUrl.clone();
  url.pathname = `/${target}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
