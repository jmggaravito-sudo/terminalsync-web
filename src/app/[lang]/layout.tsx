import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/content";
import { Nav } from "@/components/landing/Nav";

interface Props {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}

export async function generateStaticParams() {
  return [{ lang: "es" }, { lang: "en" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const d = getDict(lang);
  return {
    title: d.meta.title,
    description: d.meta.description,
    alternates: {
      canonical: `https://terminalsync.ai/${lang}`,
      languages: {
        es: "https://terminalsync.ai/es",
        en: "https://terminalsync.ai/en",
        // x-default is what search engines serve when no other language
        // matches the user's Accept-Language — we point to the ES root
        // since middleware redirects there by default.
        "x-default": "https://terminalsync.ai/es",
      },
    },
    openGraph: {
      title: d.meta.title,
      description: d.meta.description,
      locale: lang === "es" ? "es_ES" : "en_US",
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: d.meta.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: d.meta.title,
      description: d.meta.description,
      images: ["/opengraph-image"],
    },
  };
}

export default async function LangLayout({ children, params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const d = getDict(lang);
  const skipLabel = lang === "es" ? "Saltar al contenido principal" : "Skip to main content";
  // Nav lives at the layout so every page under /[lang]/ gets the language
  // switcher + cross-page navigation. Pages should no longer render <Nav>
  // themselves (would duplicate the bar).
  //
  // Skip-link is the FIRST focusable element so keyboard + screen-reader
  // users can bypass the header (logo + 5 nav links + lang switcher + 2
  // CTAs = ~9 stops) and jump straight to <main>. WCAG 2.4.1 Bypass
  // Blocks. Only visible while focused.
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-[var(--color-accent)] focus:px-4 focus:py-2 focus:text-white focus:font-semibold focus:shadow-lg"
      >
        {skipLabel}
      </a>
      <Nav dict={d} lang={lang} />
      <main id="main">{children}</main>
    </>
  );
}
