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
//   - connect-src: self + Vercel domains for Speed Insights / Analytics +
//     Rewardful's API endpoint.
//   - frame-ancestors 'none' — clickjacking-equivalent of X-Frame-Options.
// HSTS preload is on (already shipped in production but set explicitly so
// it doesn't drop if Vercel changes defaults).
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://r.wdfl.co https://*.vercel.app https://vercel.live",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://*.vercel.app https://vitals.vercel-insights.com https://r.wdfl.co https://api.getrewardful.com https://releases.terminalsync.ai",
      "frame-ancestors 'none'",
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
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
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
};

export default config;
