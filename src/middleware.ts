import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, locales } from "@/content";
import { LANDING_B } from "@/lib/launchFlags";
import { REGION_COOKIE, regionFromHeaders } from "@/lib/region";
import { isTeamFeatureEnabled } from "@/lib/teamFeature";

// The desktop app runs in a Tauri WebView. Team requests carry a verified
// bearer token and need this exact origin to read the no-store responses. Do
// not widen this to `*`: it would make the private Team response surface
// readable by arbitrary web origins.
const TEAM_TAURI_ORIGIN = "tauri://localhost";
const TEAM_CORS_METHODS = "GET, POST, OPTIONS";
const TEAM_CORS_HEADERS = "Authorization, Content-Type";

function isTeamApi(req: NextRequest) {
  return req.nextUrl.pathname.startsWith("/api/team/");
}

function withTeamTauriCors(req: NextRequest, response: NextResponse): NextResponse {
  if (!isTeamApi(req) || req.headers.get("origin") !== TEAM_TAURI_ORIGIN) return response;
  response.headers.set("Access-Control-Allow-Origin", TEAM_TAURI_ORIGIN);
  response.headers.set("Access-Control-Allow-Methods", TEAM_CORS_METHODS);
  response.headers.set("Access-Control-Allow-Headers", TEAM_CORS_HEADERS);
  response.headers.set("Access-Control-Max-Age", "600");
  response.headers.append("Vary", "Origin");
  return response;
}

function teamTauriPreflight(req: NextRequest): NextResponse | null {
  if (!isTeamApi(req) || req.method !== "OPTIONS" || req.headers.get("origin") !== TEAM_TAURI_ORIGIN) return null;
  const requested = req.headers.get("access-control-request-method");
  if (requested !== "GET" && requested !== "POST") {
    return withTeamTauriCors(req, NextResponse.json({ error: "Method not allowed" }, { status: 405 }));
  }
  return withTeamTauriCors(req, new NextResponse(null, { status: 204 }));
}

// Región para el consentimiento de cookies: el banner estricto es solo para
// visitantes de Europa. Vercel da el país en `x-vercel-ip-country`; aquí se
// traduce a la cookie `ts_region` (eu | row). Sin país fiable => `eu` (fail-safe).
// Es una cookie NECESARIA de esta sola función: sin datos personales (solo
// "eu" o "row"), de sesión (sin Max-Age: se borra al cerrar el navegador) y
// legible por JavaScript porque la home estática y el gestor de consentimiento
// la leen en el navegador.
export function withRegionCookie(req: NextRequest, res: NextResponse): NextResponse {
  try {
    const region = regionFromHeaders(req.headers);
    // Se reescribe en cada petición para que refleje el país actual (VPN, viajes).
    res.cookies.set(REGION_COOKIE, region, {
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: false,
    });
  } catch {
    /* sin cookie: el cliente asume Europa (fail-safe) */
  }
  return res;
}

// Redirect bare "/" to /es or /en based on Accept-Language.
// Any other path is either already localized (/es/..., /en/...) or an asset.
export function middleware(req: NextRequest) {
  const preflight = teamTauriPreflight(req);
  if (preflight) return preflight;

  // The Team source is intentionally deployable before its production schema.
  // Do not let a missing migration degrade authenticated requests into opaque
  // RPC failures: default to unavailable until the controlled rollout has
  // completed and a server operator explicitly enables the feature.
  if (isTeamApi(req) && !isTeamFeatureEnabled()) {
    return withTeamTauriCors(req, NextResponse.json(
      { error: "Team is temporarily unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    ));
  }
  return withTeamTauriCors(req, withRegionCookie(req, route(req)));
}

function route(req: NextRequest): NextResponse {
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
  // The first matcher remains the public-page matcher (including static /es
  // and /en), excluding APIs, _next, and files with an extension. Keep it
  // first because the region matcher contract tests this exact expression.
  // The dedicated Team matcher then brings only Team APIs into middleware.
  matcher: [
    "/((?!api(?:/|$)|_next/static|_next/image|favicon.ico|.*\\..*).*)",
    "/api/team/:path*",
  ],
};
