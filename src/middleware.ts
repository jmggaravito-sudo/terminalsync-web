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
    // Stamp the landing source as a cookie so the post-signup welcome flow
    // can pick the right copy variant (dev vs consumer). The cookie persists
    // across pages until the user signs up; the auth callback reads it and
    // forwards it to n8n. We only set it if absent so a visitor who first
    // saw /for-developers and later browses to / keeps the dev attribution.
    const res = NextResponse.next();
    if (!req.cookies.get("tsync_landing")) {
      const isDev = /^\/(?:es|en)\/for-developers(?:\/|$)/.test(pathname);
      const isConsumerHome = /^\/(?:es|en)\/?$/.test(pathname);
      if (isDev || isConsumerHome) {
        res.cookies.set("tsync_landing", isDev ? "dev" : "consumer", {
          maxAge: 60 * 60 * 24 * 30, // 30 days
          sameSite: "lax",
          path: "/",
        });
      }
    }
    return res;
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
