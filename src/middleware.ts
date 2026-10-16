import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, locales } from "@/content";
import { LANDING_B } from "@/lib/launchFlags";

// Redirect bare "/" to /es or /en based on Accept-Language.
// Any other path is either already localized (/es/..., /en/...) or an asset.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Landing B is the approved standalone landing. Keep /es and /en as the
  // public URLs while serving the static design bundle without routing its
  // visual system through the legacy landing components.
  if (LANDING_B && /^\/(?:es|en)\/?$/.test(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = "/landing-b/index.html";
    // Ya NO se fija aquí la cookie `tsync_landing`: es de atribución
    // (analítica) y no puede crearse antes del consentimiento. La crea
    // `public/consent.js` en la home estática, solo si se acepta la analítica.
    return NextResponse.rewrite(url);
  }

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
    pathname.startsWith("/admin") || // non-localized admin routes, e.g. /admin/loop-runs
    pathname.startsWith("/oauth") || // OAuth callback is language-agnostic
    pathname.startsWith("/picker") || // Google Picker bridge for desktop app
    pathname.startsWith("/auth/callback") || // Supabase magic-link landing
    pathname === "/privacy" || // Google OAuth verification requires this exact URL
    pathname === "/download" || // top-level redirect to /api/download
    pathname.includes(".") ||
    locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))
  ) {
    // La cookie `tsync_landing` (origen dev/consumer para el correo de
    // bienvenida) ya no se fija en el servidor: es atribución y solo puede
    // crearse con consentimiento de analítica. La crea `ConsentGate` en el
    // cliente (ver src/components/consent/ConsentGate.tsx). Sin cookie, el
    // callback de auth usa la variante "consumer" por defecto.
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
