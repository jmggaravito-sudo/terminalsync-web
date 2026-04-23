import Link from "next/link";
import { notFound } from "next/navigation";
import { XCircle, ArrowLeft, Mail } from "lucide-react";
import { getDict, isLocale } from "@/content";

interface Props {
  params: Promise<{ lang: string }>;
}

export default async function CheckoutCancel({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const d = getDict(lang);

  return (
    <main className="min-h-screen grid-bg flex items-center justify-center px-5 md:px-6 py-16">
      <div className="w-full max-w-lg rounded-3xl border border-[var(--color-border)] bg-[var(--color-panel)] p-8 md:p-10 text-center shadow-floating">
        <div className="mx-auto h-16 w-16 rounded-full bg-[var(--color-fg-dim)]/12 text-[var(--color-fg-dim)] flex items-center justify-center">
          <XCircle size={32} strokeWidth={2} />
        </div>

        <span className="mt-5 inline-block text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--color-fg-dim)] font-semibold">
          {d.checkout.cancel.eyebrow}
        </span>
        <h1
          className="mt-2 font-semibold tracking-tight text-[var(--color-fg-strong)] leading-[1.1]"
          style={{ fontSize: "clamp(1.5rem, 3.6vw, 2rem)" }}
        >
          {d.checkout.cancel.title}
        </h1>
        <p className="mt-3 text-[14px] text-[var(--color-fg-muted)] leading-relaxed">
          {d.checkout.cancel.body}
        </p>

        <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={`/${lang}#pricing`}
            className="inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-[13px] font-semibold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] transition-colors glow-accent"
          >
            <ArrowLeft size={14} strokeWidth={2.4} />
            {d.checkout.cancel.ctaRetry}
          </Link>
          <a
            href="mailto:hola@terminalsync.ai"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-fg-muted)] hover:text-[var(--color-fg-strong)] transition-colors"
          >
            <Mail size={13} strokeWidth={2.2} />
            {d.checkout.cancel.ctaContact}
          </a>
        </div>
      </div>
    </main>
  );
}
