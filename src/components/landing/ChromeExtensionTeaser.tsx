import { ArrowRight, Check, Chrome, Sparkles } from "lucide-react";
import type { Dict } from "@/content";

/**
 * "También en Chrome" — compact teaser bridge entre el value prop de
 * MultiAI ("3 IAs en paralelo") y el resto del funnel (Memory, Personas,
 * Pricing). El visitante recién entendió que TS junta las 3 IAs; este
 * bloque dice "y también podés probarlo en el navegador SIN instalar
 * nada", lo que cubre al usuario menos técnico y al que solo quiere
 * un sabor liviano antes de comprometerse con el desktop.
 *
 * Pattern visual: row de dos columnas. Izquierda = mock minimalista de
 * 3 columnas con dots Claude/Codex/Gemini. Derecha = copy + CTAs.
 * Mismo lenguaje que MultiAI (lift, border tokens, rounded-2xl).
 *
 * Mientras la extension NO esté en el Chrome Web Store, el CTA primario
 * apunta al repo público para users early adopters. El secundario manda
 * a #pricing para visitors que ya leyeron y prefieren la app completa.
 */
export function ChromeExtensionTeaser({ dict }: { dict: Dict }) {
  const c = dict.chromeExtension;

  return (
    <section
      id="chrome-extension"
      className="mx-auto max-w-6xl px-5 md:px-6 py-16 md:py-20"
    >
      <article className="lift rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.05fr] gap-0">
          {/* ── Visual: 3-column mini mockup ───────────────────────── */}
          <div className="relative bg-gradient-to-br from-[var(--color-accent)]/8 via-transparent to-[var(--color-accent)]/4 p-6 md:p-8 border-b md:border-b-0 md:border-r border-[var(--color-border)] flex items-center justify-center">
            <div className="w-full max-w-[420px]">
              {/* Fake popup wordmark */}
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--color-border)]">
                <div className="flex items-center gap-1.5">
                  <div className="h-5 w-5 rounded-md bg-[var(--color-accent)] text-white flex items-center justify-center">
                    <Sparkles size={10} strokeWidth={2.6} />
                  </div>
                  <div className="text-[11px] font-semibold tracking-tight">
                    <span className="text-[var(--color-fg-strong)]">Terminal</span>
                    <span className="text-[var(--color-accent)]">Sync</span>
                  </div>
                </div>
                <div className="font-mono text-[9.5px] text-[var(--color-fg-muted)] bg-[var(--color-bg)] px-1.5 py-0.5 rounded">
                  $0.0024
                </div>
              </div>
              {/* User prompt */}
              <div className="mb-2 rounded-lg bg-[var(--color-bg)] px-2.5 py-1.5 text-[10.5px] text-[var(--color-fg)] border border-[var(--color-border)]">
                <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--color-fg-dim)]">Tú</span>
                <div className="text-[10.5px] mt-0.5">¿Qué modelo razona mejor sobre esto?</div>
              </div>
              {/* 3 columns row */}
              <div className="grid grid-cols-3 gap-1.5">
                <MiniColumn brand="#d97757" label="Claude" />
                <MiniColumn brand="#10a37f" label="Codex" />
                <MiniColumn brand="#4285f4" label="Gemini" />
              </div>
            </div>
          </div>

          {/* ── Copy + CTAs ────────────────────────────────────────── */}
          <div className="p-6 md:p-9 flex flex-col justify-center">
            <span className="inline-flex self-start items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--color-accent)] border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 px-2.5 py-1 rounded-full">
              <Chrome size={11} strokeWidth={2.4} />
              {c.eyebrow}
            </span>
            <h2
              className="mt-4 font-semibold tracking-tight text-[var(--color-fg-strong)] leading-[1.12]"
              style={{ fontSize: "clamp(1.375rem, 2.6vw, 1.875rem)" }}
            >
              {c.title}
            </h2>
            <p className="mt-3 text-[14px] text-[var(--color-fg-muted)] leading-relaxed">
              {c.subtitle}
            </p>

            <ul className="mt-4 space-y-1.5">
              {c.bullets.map((b) => (
                <li
                  key={b}
                  className="flex items-start gap-2 text-[13px] text-[var(--color-fg)]"
                >
                  <Check
                    size={13}
                    className="text-[var(--color-ok)] mt-0.5 shrink-0"
                    strokeWidth={2.8}
                  />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4 text-[11.5px] text-[var(--color-fg-dim)] italic">
              {c.status}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <a
                href={c.primaryHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-accent)] text-white px-4 py-2 text-[13px] font-semibold shadow-[0_6px_18px_-6px_var(--color-accent-glow)] hover:bg-[var(--color-accent-soft)] transition-colors"
              >
                {c.primaryCta}
                <ArrowRight size={13} strokeWidth={2.4} />
              </a>
              <a
                href={c.secondaryHref}
                className="inline-flex items-center gap-1 text-[13px] font-medium text-[var(--color-fg-muted)] hover:text-[var(--color-fg-strong)] transition-colors"
              >
                {c.secondaryCta}
                <ArrowRight size={12} strokeWidth={2.4} />
              </a>
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}

function MiniColumn({ brand, label }: { brand: string; label: string }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] overflow-hidden">
      <div
        className="flex items-center gap-1 px-1.5 py-1 border-b border-[var(--color-border)]"
        style={{ borderTop: `2px solid ${brand}` }}
      >
        <div
          className="h-1.5 w-1.5 rounded-full shrink-0"
          style={{ backgroundColor: brand }}
        />
        <div className="text-[8.5px] font-semibold text-[var(--color-fg)] truncate">
          {label}
        </div>
      </div>
      <div className="px-1.5 py-1.5 space-y-1">
        {/* Skeleton lines */}
        <div className="h-1 rounded-full bg-[var(--color-fg-dim)]/20 w-full" />
        <div className="h-1 rounded-full bg-[var(--color-fg-dim)]/20 w-[85%]" />
        <div className="h-1 rounded-full bg-[var(--color-fg-dim)]/20 w-[65%]" />
        <div className="h-1 rounded-full bg-[var(--color-fg-dim)]/20 w-[90%]" />
        <div className="h-1 rounded-full bg-[var(--color-fg-dim)]/20 w-[50%]" />
      </div>
    </div>
  );
}
