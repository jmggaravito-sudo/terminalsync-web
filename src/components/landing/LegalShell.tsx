import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Locale } from "@/content";
import { LandingBFooter } from "@/components/landing-b/LandingBFooter";

// Shared shell for legal-style pages (privacy, terms, security, about,
// blog). Uses the same slim header + max-w-3xl prose-style body that the
// existing affiliates legal page uses, so all "secondary" pages feel
// consistent. Content is passed in via children — pages stay lean.
export function LegalShell({
  lang,
  title,
  subtitle,
  lastUpdated,
  children,
  backHref,
  backLabel,
}: {
  lang: Locale;
  title: string;
  subtitle?: string;
  lastUpdated?: string;
  children: React.ReactNode;
  backHref?: string;
  backLabel?: string;
}) {
  const homeLabel = lang === "es" ? "Volver al inicio" : "Back to home";
  return (
    <div className="landing-b-theme min-h-screen">
      <article className="mx-auto max-w-6xl px-5 pb-14 pt-8 md:px-8 md:pb-20 md:pt-12">
        <Link
          href={backHref ?? `/${lang}`}
          className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#5a37d6] transition-colors hover:text-[#3d17b8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6a48e8]"
        >
          <ArrowLeft size={15} strokeWidth={2.4} />
          {backLabel ?? homeLabel}
        </Link>

        <header className="mt-7 rounded-[28px] border border-[#e2e4e9] bg-[radial-gradient(ellipse_at_top_right,_rgba(106,72,232,0.09),_transparent_55%),_white] p-6 shadow-[0_20px_55px_-40px_rgba(32,29,51,0.35)] md:p-10">
          <p className="text-[11px] font-mono font-semibold uppercase tracking-[0.18em] text-[#6a48e8]">
            Terminal Sync · {lang === "es" ? "Legal" : "Legal"}
          </p>
          <h1 className="mt-4 text-[30px] font-semibold leading-[1.08] tracking-[-0.035em] text-[#16181d] md:text-[42px]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-4 max-w-3xl text-[15.5px] leading-relaxed text-[#565b64] md:text-[17px]">
              {subtitle}
            </p>
          )}
          {lastUpdated && (
            <p className="mt-5 text-[11px] font-mono uppercase tracking-[0.12em] text-[#777d87]">
              {lastUpdated}
            </p>
          )}
        </header>

        <div className="mx-auto mt-6 max-w-3xl rounded-[24px] border border-[#e2e4e9] bg-white px-5 py-7 shadow-[0_14px_40px_-32px_rgba(22,24,29,0.32)] md:px-10 md:py-10">
          <div className="prose-legal">{children}</div>
        </div>
      </article>
      <LandingBFooter lang={lang} />
    </div>
  );
}
