import type { Metadata } from "next";
import { Suspense } from "react";
import { BundlesEditor } from "./BundlesEditor";

interface Props { params: Promise<{ lang: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: lang === "es" ? "Admin · Bundles (Stack Packs)" : "Admin · Bundles (Stack Packs)",
    robots: { index: false, follow: false },
  };
}

/** Bypass admin for Stack Packs. Auth via ?key=<DISCOVERY_INGEST_KEY>
 *  in the URL, same pattern as /admin-bypass/prospects and
 *  /admin-bypass/discovery — JM curates without needing the Supabase
 *  admin auth UI in the loop.
 *
 *  Renders a list of existing bundles + a per-bundle items editor that
 *  can mix the 3 pillars (connector / skill / cli).
 */
export default async function AdminBundlesBypass({ params }: Props) {
  const { lang } = await params;
  const isEs = lang === "es";
  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)]">
      <section className="mx-auto max-w-4xl px-4 sm:px-6 pt-16 sm:pt-20 pb-16">
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.16em] text-amber-400">
          ⚠ Bypass mode
        </div>
        <h1 className="text-[22px] sm:text-[28px] font-semibold tracking-tight">
          {isEs ? "Stack Packs · Editor" : "Stack Packs · Editor"}
        </h1>
        <p className="mt-2 text-[13px] text-[var(--color-fg-muted)]">
          {isEs
            ? "Editá los ítems de cada Stack Pack (conectores, skills, CLIs). Los cambios se guardan vía la API admin con tu ?key= en la URL."
            : "Edit each Stack Pack's items (connectors, skills, CLIs). Changes save via the admin API using the ?key= URL parameter."}
        </p>
        <div className="mt-6">
          <Suspense fallback={null}>
            <BundlesEditor lang={lang} />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
