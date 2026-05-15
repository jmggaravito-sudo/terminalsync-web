import type { Metadata } from "next";
import { Suspense } from "react";
import { ProposalsClient } from "./ProposalsClient";

interface Props {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang: _lang } = await params;
  return {
    title: "Admin · Bundle Proposals",
    robots: { index: false, follow: false },
  };
}

/** Bypass admin page for the bundle-curator queue. Auth via
 *  `?key=<DISCOVERY_INGEST_KEY>` in the URL — same shape the existing
 *  /admin-bypass/bundles and /admin-bypass/discovery pages use.
 *
 *  The actual list + actions happen in `ProposalsClient` because
 *  fetching needs to roundtrip with the same `?key=` parameter the
 *  user typed in their URL, which is only readable client-side after
 *  the page mounts. (We could SSR with the key from searchParams too,
 *  but mounting once + fetching is simpler and the bypass surface is
 *  already client-driven everywhere else in this admin.)
 */
export default async function AdminBundleProposalsPage({ params }: Props) {
  const { lang } = await params;
  const isEs = lang === "es";
  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)]">
      <section className="mx-auto max-w-5xl px-4 sm:px-6 pt-16 sm:pt-20 pb-16">
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.16em] text-amber-400">
          ⚠ Bypass mode
        </div>
        <h1 className="text-[22px] sm:text-[28px] font-semibold tracking-tight">
          {isEs ? "Stack Packs · Curador" : "Stack Packs · Curator"}
        </h1>
        <p className="mt-2 text-[13px] text-[var(--color-fg-muted)]">
          {isEs
            ? "Bundles propuestos por Claude/n8n. Revisalos en 5 min, publicá los que no apesten."
            : "Bundles proposed by Claude/n8n. Scan in 5 min, publish the ones that don't suck."}
        </p>
        <div className="mt-6">
          <Suspense fallback={null}>
            <ProposalsClient lang={lang} />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
