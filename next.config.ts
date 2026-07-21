import type { NextConfig } from "next";

// Security headers applied to every response. CSP is on-by-default with the
// minimum surface the landing actually needs:
//   - script-src: self + Vercel's runtime (live preview / analytics / speed
//     insights inject inline scripts) + Rewardful (rw.js + r.wdfl.co).
//   - style-src: self + 'unsafe-inline' for Tailwind's small inline styles
//     and Google Fonts CSS (fonts.googleapis.com).
//   - font-src: Google's CDN.
//   - img-src: self + data: + https: so OG/social/marketplace icons render
//     without breakage. blob: for any future canvas/screenshot work.
//   - connect-src: self + Supabase (auth/magic-link/OAuth token exchange +
//     REST + realtime — without this the browser blocks the fetch to
//     *.supabase.co with "Failed to fetch") + Vercel domains for Speed
//     Insights / Analytics + Rewardful's API endpoint.
//   - frame-ancestors 'self' — clickjacking protection against third
//     parties (equivalent to X-Frame-Options: SAMEORIGIN). Same-origin
//     iframes are allowed so the landing demo grid (/demos/*.html) can
//     render. 'none' would block our own iframes too.
// HSTS preload is on (already shipped in production but set explicitly so
// it doesn't drop if Vercel changes defaults).
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://accounts.google.com https://*.google.com https://r.wdfl.co https://*.vercel.app https://vercel.live",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "frame-src 'self' https://accounts.google.com https://docs.google.com https://*.google.com",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.googleapis.com https://*.google.com https://*.vercel.app https://vitals.vercel-insights.com https://r.wdfl.co https://api.getrewardful.com https://releases.terminalsync.ai",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=(self)",
  },
  // X-Frame-Options DENY se removió 2026-06-19 porque bloqueaba los iframes
  // propios de la grilla de demos en la landing (servidos desde /demos/*.html).
  // La protección contra clickjacking de terceros la mantiene la directiva CSP
  // `frame-ancestors 'none'` — equivalente moderno y más granular (permite
  // same-origin de forma implícita vs DENY global).
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    // keep room for future RSC tweaks
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      // /[lang]/marketplace fue retirado 2026-06-06 — el cajón Integraciones
      // del Lab desktop ya muestra todo el catálogo directamente via
      // /api/marketplace/catalog, así que el detour a la página dejó de
      // tener sentido. Redirect 301 a /stacks (kits) — el destino más
      // cercano para discovery humano. SEO y bookmarks existentes siguen
      // resolviendo a algo útil.
      {
        source: "/:lang/marketplace",
        destination: "/:lang/stacks",
        permanent: true,
      },
      // El root /marketplace (sin lang prefix) puede aparecer en alguna
      // URL vieja del Lab — redirigimos al ES por default ya que es el
      // primary del producto.
      {
        source: "/marketplace",
        destination: "/es/admin",
        permanent: true,
      },
    ];
  },
};

export default config;
