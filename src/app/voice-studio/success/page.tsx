import { stripe } from "@/lib/stripe";
import {
  licenseUrl,
  ordersUrl,
} from "@/lib/voiceStudioLicense";

// Post-purchase landing (Stripe redirects here with {CHECKOUT_SESSION_ID}).
// Verifies the payment server-side and hands the client their personal
// links: the production dashboard (submit videos, see queue) and the voice
// license, if not signed yet.
export const metadata = { title: "Voice Studio — Welcome aboard" };

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  const session = session_id
    ? await stripe?.checkout.sessions.retrieve(session_id).catch(() => null)
    : null;
  const email = session?.customer_details?.email ?? null;
  const paid = session?.payment_status === "paid";
  const isVoiceStudio = session?.metadata?.business === "voice-studio";

  if (!email || !isVoiceStudio) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-20">
        <h1 className="text-2xl font-semibold text-zinc-900">
          Session not found
        </h1>
        <p className="mt-3 text-zinc-600">
          We couldn&apos;t match this link to a payment. Reply to your
          receipt email and we&apos;ll send your dashboard link directly.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
        {paid ? "Welcome aboard 🎬" : "Payment processing…"}
      </h1>
      <p className="mt-3 leading-relaxed text-zinc-600">
        {paid ? (
          <>
            Your payment went through. Two things before we start producing
            in <strong>{email}</strong>&apos;s voice:
          </>
        ) : (
          <>
            We&apos;re still confirming your payment — these links will work
            as soon as it clears.
          </>
        )}
      </p>

      <ol className="mt-8 space-y-4">
        <li className="rounded-2xl border border-zinc-200 bg-white p-5">
          <p className="font-semibold text-zinc-900">
            1 · Sign the voice license
          </p>
          <p className="mt-1 text-sm text-zinc-600">
            One page, bilingual, two minutes. No production starts without
            it.
          </p>
          <a
            href={licenseUrl(email)}
            className="mt-3 inline-flex rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-300"
          >
            Sign the license →
          </a>
        </li>
        <li className="rounded-2xl border border-zinc-200 bg-white p-5">
          <p className="font-semibold text-zinc-900">
            2 · Submit your first videos
          </p>
          <p className="mt-1 text-sm text-zinc-600">
            Your production dashboard: paste YouTube links, see your queue
            and delivered videos anytime.
          </p>
          <a
            href={ordersUrl(email)}
            className="mt-3 inline-flex rounded-full bg-zinc-950 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700"
          >
            Open my dashboard →
          </a>
        </li>
      </ol>

      <p className="mt-10 text-sm text-zinc-500">
        Save both links — they work without a password (30 days, re-mintable).
        Questions? Just reply to your receipt.
      </p>
    </main>
  );
}
