import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, locales } from "@/content";

// Redirect bare "/" to /es or /en based on Accept-Language.
// Any other path is either already localized (/es/..., /en/...) or an asset.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Kill switch — when NEW_SIGNUPS_DISABLED=true, send first-time visitors to
  // /at-capacity instead of the login form. Existing users (any cookie that
  // looks like a Supabase auth token) sail through unaffected. Toggle via env
  // var without redeploying — Vercel propagates env changes in ~30s.
  if (process.env.NEW_SIGNUPS_DISABLED === "true") {
    const isLoginPath = /^\/(?:es|en)\/login\/?$/.test(pathname);
    const isAtCapacity = /^\/(?:es|en)\/at-capacity\/?$/.test(pathname);
    if (isLoginPath && !isAtCapacity) {
      const cookies = req.cookies.getAll();
      const hasAuthSession = cookies.some((c) => c.name.startsWith("sb-"));
      if (!hasAuthSession) {
        const lang = pathname.startsWith("/en") ? "en" : "es";
        const url = req.nextUrl.clone();
        url.pathname = `/${lang}/at-capacity`;
        return NextResponse.redirect(url);
      }
    }
  }

  // Skip assets, API, and already-localized paths.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/oauth") || // OAuth callback is language-agnostic
    pathname.startsWith("/auth/callback") || // Supabase magic-link landing
    pathname === "/download" || // top-level redirect to /api/download
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
