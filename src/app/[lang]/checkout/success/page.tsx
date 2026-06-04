import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Download, ArrowRight } from "lucide-react";
import { getDict, isLocale } from "@/content";
import { stripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { mintLinkCode } from "@/app/api/extension/_lib/linkCodes";
import { ExtensionLinkCard } from "./ExtensionLinkCard";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ session_id?: string }>;
}

/**
 * Issue a one-shot extension link code based on the Stripe checkout
 * session. Returns null if anything in the chain is missing — page
 * just won't render the extension card in that case. We never throw
 * up to the page; this is a strictly best-effort upsell.
 */
async function issueExtensionLinkCode(
  sessionId: string | undefined,
): Promise<{ code: string; expiresAt: string } | null> {
  if (!sessionId) return null;
  // `stripe` is null on local dev sandboxes without STRIPE_SECRET_KEY.
  // Same for the admin Supabase client. We treat either missing piece
  // as "skip the extension card" — never fatal.
  if (!stripe) return null;
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const supabaseUserId = session.metadata?.supabase_user_id;
    if (!supabaseUserId) return null;
    const supabase = getSupabaseAdmin();
    if (!supabase) return null;
    return await mintLinkCode(supabase, supabaseUserId);
  } catch (err) {
    console.warn("[checkout/success] extension link mint skipped", err);
    return null;
  }
}

export default async function CheckoutSuccess({
  params,
  searchParams,
}: Props) {
  const { lang } = await params;
  const { session_id } = await searchParams;
  if (!isLocale(lang)) notFound();
  const d = getDict(lang);

  const extensionLink = await issueExtensionLinkCode(session_id);

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

        {extensionLink && d.checkout.success.extensionLink && (
          <ExtensionLinkCard
            code={extensionLink.code}
            expiresAt={extensionLink.expiresAt}
            copy={d.checkout.success.extensionLink}
          />
        )}

        {session_id && (
          <p className="mt-7 text-[10.5px] font-mono text-[var(--color-fg-dim)] truncate">
            {d.checkout.success.receipt.replace("{{id}}", session_id)}
          </p>
        )}
      </div>
    </main>
  );
}
