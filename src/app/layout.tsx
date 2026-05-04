import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { defaultLocale } from "@/content";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://terminalsync.ai"),
  title: {
    default: "TerminalSync — Memoria, privacidad y movilidad para tu IA",
    // Plain "%s" without "· TerminalSync" — the per-page title already
    // includes the brand. The previous template doubled it (e.g.
    // "TerminalSync — Lleva ... · TerminalSync"), pushing past Google's
    // 60-char SERP truncation.
    template: "%s",
  },
  description:
    "Tu agente IA (Claude/Codex) sigue corriendo aunque se caiga internet o cambies de Mac. Cifrado AES-256 zero-knowledge. Acceso desde cualquier dispositivo.",
  authors: [{ name: "TerminalSync" }],
  // Explicit image + social tags — Next auto-detects opengraph-image.tsx but
  // spelling them out avoids any ambiguity for scrapers that don't follow the
  // convention. The referenced /opengraph-image route is the edge-generated PNG.
  openGraph: {
    type: "website",
    siteName: "TerminalSync",
    url: "https://terminalsync.ai",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "TerminalSync — Lleva tu Claude Code a cualquier parte",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/opengraph-image"],
    creator: "@terminalsync",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/brand/logo-square.svg", sizes: "any", type: "image/svg+xml" },
    ],
    apple: "/brand/logo-square.svg",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#08090b" },
  ],
};

// Inline pre-paint script:
//  1. Sets <html lang> from the URL path so screen readers + search crawlers
//     (that execute JS) see the right language before hydration. SSG-safe.
//  2. Sets theme (light/dark) to avoid a flash of the wrong mode.
const bootScript = `
(function(){
  try {
    var p = location.pathname;
    var lang = p.indexOf('/en') === 0 ? 'en' : 'es';
    document.documentElement.setAttribute('lang', lang);

    var s = localStorage.getItem('terminalsync:theme');
    var prefersDark = window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = s === 'light' || s === 'dark' ? s : (prefersDark ? 'dark' : 'light');
    if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.style.colorScheme = theme;
  } catch(e){}
})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The static default covers /es (middleware redirects / to /es by default)
  // and the inline script rewrites it for /en pages before first paint.
  return (
    <html lang={defaultLocale} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        {process.env.NEXT_PUBLIC_REWARDFUL_API_KEY && (
          <>
            {/* Rewardful snippet — inline queue MUST load before the async
                script so `window.rewardful(...)` calls made by the page JS
                are buffered correctly until rw.js is ready. */}
            <script
              dangerouslySetInnerHTML={{
                __html:
                  "(function(w,r){w._rwq=r;w[r]=w[r]||function(){(w[r].q=w[r].q||[]).push(arguments)}})(window,'rewardful');",
              }}
            />
            <script
              async
              src="https://r.wdfl.co/rw.js"
              data-rewardful={process.env.NEXT_PUBLIC_REWARDFUL_API_KEY}
            />
          </>
        )}
      </head>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
