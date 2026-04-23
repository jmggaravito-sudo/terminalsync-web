import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://terminalsync.ai"),
  title: {
    default: "TerminalSync — Lleva tu Claude Code a cualquier parte",
    template: "%s · TerminalSync",
  },
  description:
    "Sincroniza tus terminales, archivos y el contexto de tu IA entre computadoras al instante. Instalación de Claude Code en 1 clic.",
  authors: [{ name: "TerminalSync" }],
  openGraph: {
    type: "website",
    siteName: "TerminalSync",
    url: "https://terminalsync.ai",
  },
  twitter: { card: "summary_large_image" },
  icons: {
    icon: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#08090b" },
  ],
};

// Runs before React hydrates — no flash of the wrong theme.
const themeScript = `
(function(){
  try {
    var s = localStorage.getItem('terminalsync:theme');
    var prefersDark = window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = s === 'light' || s === 'dark' ? s : (prefersDark ? 'dark' : 'light');
    if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.style.colorScheme = theme;
  } catch(e){}
})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
