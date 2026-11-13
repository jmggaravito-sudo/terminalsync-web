import Link from "next/link";

// Voice Studio service agreement v1 — the version-specific HTTPS page the
// quote intake validates against (VOICE_STUDIO_SERVICE_AGREEMENT_URL).
// Text approved by the operator on 2026-11-12 from
// docs/voice-studio-service-agreement-draft.md with placeholders filled.
export const metadata = {
  title: "Voice Studio — Service Agreement (v1)",
  robots: { index: false, follow: false },
};

export default function AgreementPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="font-mono text-xs tracking-wide text-zinc-400">
        VOICE STUDIO · SERVICE AGREEMENT · VERSION v1 · 2026-11-12
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">
        Voice Studio Service Agreement
      </h1>

      <div className="mt-8 space-y-5 text-sm leading-relaxed text-zinc-700">
        <p>
          <strong>Parties.</strong> This agreement is between Voice Studio, a
          service operated by TerminalSync (terminalsync.ai, support:
          hola@terminalsync.ai), and the customer identified in the account and
          final order. If accepting for an organization, you confirm you are
          authorized to do so.
        </p>
        <p>
          <strong>Service.</strong> DUB provides Spanish dubbing using a catalog
          voice. LIP includes Spanish dubbing and an additional lip-sync pass,
          subject to footage review. Shorts or Reels are included only when
          itemized in your order. Voice cloning is not included and is not
          authorized under this agreement. The confirmed order sets the
          deliverables, price, taxes where applicable, schedule and revision
          terms.
        </p>
        <p>
          <strong>Content and permission.</strong> For each order, you confirm
          that you have the rights or permissions necessary to submit and
          process the footage, audio, and appearances in it, and to use the
          resulting work for your intended purpose. You give Voice Studio
          permission to process that material and use its disclosed production
          providers only as needed to perform the service. No permission to
          publish your work as a sample, use it for marketing, or clone a voice
          is granted by this agreement.
        </p>
        <p>
          <strong>Quotes and payment.</strong> A cart total is an estimate, and
          a request is not a purchase. We review the footage and send a final
          written quote for your approval before payment. Nothing is charged
          when you submit the request. Every production order is fully
          refundable until the video enters production, and monthly packs can
          be paused or cancelled before the next billing cycle — every video
          delivered stays on your channel. No turnaround or result is promised
          beyond the confirmed order.
        </p>
        <p>
          <strong>Handling and delivery.</strong> We provide the agreed outputs
          through the delivery method in your order. See our{" "}
          <Link href="/privacy" className="underline">
            privacy notice
          </Link>{" "}
          for the providers, processing, retention, and your choices. Contact
          hola@terminalsync.ai about delivery or data questions.
        </p>
        <p>
          <strong>Electronic acceptance.</strong> By checking the acceptance box
          and submitting your request, you indicate agreement to this version.
          Keep a copy for your records. A new version requires a new
          acceptance; rights are confirmed separately for each request.
        </p>
      </div>

      <p className="mt-10 border-t border-zinc-200 pt-6 text-xs text-zinc-500">
        Version v1 — published 2026-11-12. This page URL is referenced by the
        quote intake; amended text will always be published at a new version
        and URL.
      </p>
    </main>
  );
}
