import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Download, ArrowRight } from "lucide-react";
import { getDict, isLocale } from "@/content";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ session_id?: string }>;
}

export default async function CheckoutSuccess({
  params,
  searchParams,
}: Props) {
  const { lang } = await params;
  const { session_id } = await searchParams;
  if (!isLocale(lang)) notFound();
  const d = getDict(lang);

  return (
    <main className="min-h-screen grid-bg flex items-center justify-center px-5 md:px-6 py-16">
      <div className="w-full max-w-lg rounded-3xl border border-[var(--color-border)] bg-[var(--color-panel)] p-8 md:p-10 text-center shadow-floating">
        <div className="mx-auto h-16 w-16 rounded-full bg-[var(--color-ok)]/12 text-[var(--color-ok)] flex items-center justify-center">
          <CheckCircle2 size={32} strokeWidth={2} />
        </div>

        <span className="mt-5 inline-block text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--color-ok)] font-semibold">
          {d.checkout.success.eyebrow}
        </span>
        <h1
          className="mt-2 font-semibold tracking-tight text-[var(--color-fg-strong)] leading-[1.1]"
          style={{ fontSize: "clamp(1.5rem, 3.6vw, 2rem)" }}
        >
          {d.checkout.success.title}
        </h1>
        <p className="mt-3 text-[14px] text-[var(--color-fg-muted)] leading-relaxed">
          {d.checkout.success.body}
        </p>

        <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="#"
            className="inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-[13px] font-semibold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] transition-colors glow-accent"
          >
            <Download size={14} strokeWidth={2.4} />
            {d.checkout.success.ctaDownload}
          </a>
          <Link
            href={`/${lang}`}
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-fg-muted)] hover:text-[var(--color-fg-strong)] transition-colors"
          >
            {d.checkout.success.ctaHome}
            <ArrowRight size={13} strokeWidth={2.4} />
          </Link>
        </div>

        {session_id && (
          <p className="mt-7 text-[10.5px] font-mono text-[var(--color-fg-dim)] truncate">
            {d.checkout.success.receipt.replace("{{id}}", session_id)}
          </p>
        )}
      </div>
    </main>
  );
}
