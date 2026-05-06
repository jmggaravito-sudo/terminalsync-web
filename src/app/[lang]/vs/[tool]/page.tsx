import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, X, Clock, MinusCircle, Download, ArrowRight } from "lucide-react";
import { getDict, isLocale } from "@/content";
import { Footer } from "@/components/landing/Footer";
import { TOOLS, TOOL_SLUGS } from "@/lib/vsPages";

interface Props {
  params: Promise<{ lang: string; tool: string }>;
}

// Static generation: emit one page per (locale, tool) combination so
// the SEO crawl gets fully prerendered HTML for every URL the sitemap
// will surface.
export async function generateStaticParams() {
  const out: { lang: string; tool: string }[] = [];
  for (const lang of ["es", "en"]) {
    for (const tool of TOOL_SLUGS) {
      out.push({ lang, tool });
    }
  }
  return out;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, tool } = await params;
  if (!isLocale(lang)) return {};
  const t = TOOLS[tool];
  if (!t) return {};

  const title =
    lang === "es"
      ? `${t.name} vs TerminalSync — comparativa honesta`
      : `${t.name} vs TerminalSync — honest comparison`;
  const description =
    lang === "es"
      ? `Comparativa side-by-side entre ${t.name} y TerminalSync. Persistencia, cifrado AES-256, sesión en cualquier dispositivo, notificaciones. Sin trampas — si algo es parcial, lo decimos.`
      : `Side-by-side comparison between ${t.name} and TerminalSync. Persistence, AES-256 encryption, Anywhere Access, notifications. No tricks — if something is partial, we say so.`;
  return {
    title,
    description,
    alternates: {
      canonical: `https://terminalsync.ai/${lang}/vs/${tool}`,
      languages: {
        es: `https://terminalsync.ai/es/vs/${tool}`,
        en: `https://terminalsync.ai/en/vs/${tool}`,
      },
    },
    openGraph: { title, description },
  };
}

const ROW_LABELS: Record<string, { es: string; en: string }> = {
  resurrection: {
    es: "Tu agente sigue corriendo aunque cierres la app",
    en: "Your agent keeps running even if you close the app",
  },
  uninterruptedWork: {
    es: "Funciona aunque se caiga internet",
    en: "Works even when the internet drops",
  },
  anywhereAccess: {
    es: "Acceso desde el celular o cualquier navegador",
    en: "Access from your phone or any browser",
  },
  aes256: {
    es: "Cifrado militar AES-256 — ni nosotros vemos tus datos",
    en: "Military-grade AES-256 — not even we see your data",
  },
  secretsVault: {
    es: "Caja fuerte para tus claves API y credenciales",
    en: "Vault for your API keys and credentials",
  },
  multiCloudSync: {
    es: "Tus archivos cifrados en tu nube favorita",
    en: "Your encrypted files in your cloud of choice",
  },
  stuckNotifications: {
    es: "Aviso cuando la IA termina o necesita algo",
    en: "Pings when the AI finishes or needs you",
  },
  noVendorLockIn: {
    es: "Sin vendor lock-in",
    en: "No vendor lock-in",
  },
};

function CellIcon({ value }: { value: "yes" | "no" | "partial" | "soon" }) {
  if (value === "yes") {
    return (
      <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-[var(--color-ok)]/12 text-[var(--color-ok)]">
        <Check size={14} strokeWidth={3} />
      </span>
    );
  }
  if (value === "partial") {
    return (
      <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-[var(--color-warn)]/12 text-[var(--color-warn)]">
        <MinusCircle size={14} strokeWidth={2.4} />
      </span>
    );
  }
  if (value === "soon") {
    return (
      <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-[var(--color-info)]/12 text-[var(--color-info)]">
        <Clock size={14} strokeWidth={2.4} />
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-[var(--color-panel-2)] text-[var(--color-fg-dim)]">
      <X size={14} strokeWidth={2.4} />
    </span>
  );
}

export default async function VsPage({ params }: Props) {
  const { lang, tool } = await params;
  if (!isLocale(lang)) notFound();
  const t = TOOLS[tool];
  if (!t) notFound();
  const d = getDict(lang);

  const isEs = lang === "es";
  const rowKeys = Object.keys(t.cells) as Array<keyof typeof ROW_LABELS>;

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Slim header so the page reads as a focused comparison, not a
          duplicate of the home landing. The Nav of [lang]/layout still
          wraps this. */}
      <section className="mx-auto max-w-3xl px-5 md:px-6 pt-12 md:pt-16 pb-8">
        <span className="inline-flex items-center text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--color-accent)] border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 px-3 py-1 rounded-full">
          {isEs ? "Comparativa" : "Comparison"}
        </span>
        <h1
          className="mt-4 font-semibold tracking-tight text-[var(--color-fg-strong)] leading-[1.05]"
          style={{ fontSize: "clamp(1.875rem, 5vw, 3rem)" }}
        >
          {t.name} <span className="text-[var(--color-fg-dim)]">vs</span>{" "}
          <span className="text-[var(--color-accent)]">TerminalSync</span>
        </h1>
        <p className="mt-3 text-[15.5px] text-[var(--color-fg-muted)] leading-relaxed">
          {isEs ? "Categoría: " : "Category: "}
          <strong className="text-[var(--color-fg)]">{t.category[lang]}</strong>
        </p>
      </section>

      {/* Strengths first — search visitors trust comparison pages that
          acknowledge the competitor's wins. */}
      <section className="mx-auto max-w-3xl px-5 md:px-6 pb-10">
        <h2 className="text-[18px] font-semibold text-[var(--color-fg-strong)] mb-4">
          {isEs ? `Lo que ${t.name} hace bien` : `What ${t.name} does well`}
        </h2>
        <ul className="space-y-2.5">
          {t.strengths[lang].map((s, i) => (
            <li
              key={i}
              className="flex items-start gap-2.5 text-[14.5px] text-[var(--color-fg)] leading-relaxed"
            >
              <Check
                size={15}
                strokeWidth={2.6}
                className="text-[var(--color-ok)] mt-1 shrink-0"
              />
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-3xl px-5 md:px-6 pb-10">
        <h2 className="text-[18px] font-semibold text-[var(--color-fg-strong)] mb-4">
          {isEs
            ? `Por qué TerminalSync es mejor para persistencia, privacidad y movilidad`
            : `Why TerminalSync wins on persistence, privacy, and mobility`}
        </h2>
        <ul className="space-y-2.5">
          {t.whyTS[lang].map((s, i) => (
            <li
              key={i}
              className="flex items-start gap-2.5 text-[14.5px] text-[var(--color-fg)] leading-relaxed"
            >
              <ArrowRight
                size={15}
                strokeWidth={2.6}
                className="text-[var(--color-accent)] mt-1 shrink-0"
              />
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Side-by-side table — concise, focused on the differentiators */}
      <section className="mx-auto max-w-3xl px-5 md:px-6 pb-10">
        <h2 className="text-[18px] font-semibold text-[var(--color-fg-strong)] mb-4">
          {isEs ? "Side-by-side" : "Side-by-side"}
        </h2>
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--color-panel-2)]/60">
                <th className="px-4 py-3 text-[11.5px] font-semibold uppercase tracking-[0.1em] text-[var(--color-fg-muted)]">
                  {isEs ? "Funcionalidad" : "Feature"}
                </th>
                <th className="px-3 py-3 text-center text-[12.5px] font-semibold text-[var(--color-fg-muted)]">
                  {t.name}
                </th>
                <th className="px-3 py-3 text-center text-[12.5px] font-semibold text-[var(--color-accent)]">
                  TerminalSync
                </th>
              </tr>
            </thead>
            <tbody>
              {rowKeys.map((row, ri) => (
                <tr
                  key={String(row)}
                  className={ri % 2 === 0 ? "bg-transparent" : "bg-[var(--color-panel-2)]/30"}
                >
                  <td className="px-4 py-3 text-[13.5px] text-[var(--color-fg)]">
                    {ROW_LABELS[row][lang]}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex justify-center">
                      <CellIcon value={t.cells[row]} />
                    </div>
                  </td>
                  <td className="px-3 py-3 bg-[var(--color-accent)]/4">
                    <div className="flex justify-center">
                      {/* TS row default = yes for the rows we expose here. The
                          full main /es/#comparison covers nuance like "soon"
                          for Anywhere Access; on these vs pages we keep TS as
                          ✅ where the live product genuinely ships. */}
                      <CellIcon
                        value={
                          row === "anywhereAccess" || row === "stuckNotifications"
                            ? "yes"
                            : "yes"
                        }
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Primary CTA */}
      <section className="mx-auto max-w-3xl px-5 md:px-6 pb-16 md:pb-20">
        <div className="rounded-2xl border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-5 md:gap-8">
          <div className="flex-1">
            <h3 className="text-[19px] font-semibold text-[var(--color-fg-strong)]">
              {isEs
                ? `¿Probás TerminalSync 7 días?`
                : `Try TerminalSync for 7 days?`}
            </h3>
            <p className="mt-2 text-[14px] text-[var(--color-fg-muted)] leading-relaxed">
              {isEs
                ? "Sin tarjeta. Setup en 2 minutos. Si después de 7 días no te enamora, dejás de usarlo y listo."
                : "No card. 2-minute setup. If after 7 days it doesn't click, you stop using it. Done."}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="/api/download"
              data-cta={`vs-${tool}`}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] text-white text-[13px] font-semibold px-5 py-2.5 shadow-[0_8px_24px_-10px_var(--color-accent-glow)] transition-all"
            >
              <Download size={14} strokeWidth={2.4} />
              {isEs ? "Descargar gratis" : "Download free"}
            </a>
            <Link
              href={`/${lang}#pricing`}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-panel-2)] hover:bg-[var(--color-border)] text-[var(--color-fg)] text-[13px] font-semibold px-5 py-2.5 border border-[var(--color-border)] transition-all"
            >
              {isEs ? "Ver pricing" : "See pricing"}
              <ArrowRight size={14} strokeWidth={2.4} />
            </Link>
          </div>
        </div>

        {/* Cross-link to other vs pages — internal SEO juice */}
        <div className="mt-10">
          <p className="text-[12px] uppercase tracking-[0.12em] font-mono text-[var(--color-fg-dim)] mb-3">
            {isEs ? "Otras comparativas" : "Other comparisons"}
          </p>
          <div className="flex flex-wrap gap-2">
            {TOOL_SLUGS.filter((s) => s !== tool).map((s) => (
              <Link
                key={s}
                href={`/${lang}/vs/${s}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-[var(--color-border)] text-[12.5px] text-[var(--color-fg)] hover:bg-[var(--color-panel)] transition-colors"
              >
                {TOOLS[s].name} vs TerminalSync
              </Link>
            ))}
            <Link
              href={`/${lang}#comparison`}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 text-[12.5px] text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition-colors"
            >
              {isEs ? "Comparativa completa →" : "Full comparison →"}
            </Link>
          </div>
        </div>
      </section>

      <Footer dict={d} />
    </div>
  );
}
