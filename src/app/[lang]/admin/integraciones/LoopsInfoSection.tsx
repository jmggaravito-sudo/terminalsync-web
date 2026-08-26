"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Info } from "lucide-react";

interface LoopInfo {
  title: { es: string; en: string };
  what: { es: string; en: string };
  steps: { es: string[]; en: string[] };
}

const LOOPS: LoopInfo[] = [
  {
    title: {
      es: "Supervisión de integraciones",
      en: "Integration supervision",
    },
    what: {
      es: 'Es el que corre el botón "Correr ahora": revisa que todo lo instalable —connectors y skills— funcione en las 4 IAs (Claude, Codex, Gemini y GLM) y que el catálogo esté sano.',
      en: 'This is the one behind the "Run now" button: it checks that everything installable — connectors and skills — works across the 4 AIs (Claude, Codex, Gemini and GLM), and that the catalog is healthy.',
    },
    steps: {
      es: [
        "Baja el catálogo que ve la app.",
        "Chequea que nada prometa una IA a la que en realidad no llega.",
        "Verifica que todo cubra las 4 IAs; si aparece algo nuevo que no cumple, lo frena.",
        "Confirma que los plugins apunten a connectors y skills que existen de verdad.",
        "Muestra la cobertura IA por IA. Verde = todo en orden; rojo = te dice exactamente qué falta.",
      ],
      en: [
        "Pulls the catalog the app actually sees.",
        "Checks that nothing promises an AI it doesn't really reach.",
        "Verifies everything covers all 4 AIs; if something new doesn't, it blocks it.",
        "Confirms plugins point at connectors and skills that really exist.",
        "Shows coverage AI by AI. Green = all good; red = tells you exactly what's missing.",
      ],
    },
  },
  {
    title: {
      es: "Curación de connectors / skills / plugins / kits",
      en: "Connector / skill / plugin / kit curation",
    },
    what: {
      es: "Son los loops que descubren candidatos nuevos: cada uno sale a buscar candidatos nuevos de su tipo, los evalúa, y deja listo un PR para revisar. No publica nada solo.",
      en: "These are the loops that discover new candidates: each one goes out to find new candidates of its type, evaluates them, and leaves a PR ready for review. Nothing goes live on its own.",
    },
    steps: {
      es: [
        "Busca fuentes y candidatos.",
        "Filtra por calidad y criterios.",
        "Arma el archivo de catálogo (.md).",
        'Abre un PR draft (y, si hace falta código en la app, su "PR espejo").',
        "Anota el resultado para que quede registrado.",
      ],
      en: [
        "Looks for sources and candidates.",
        "Filters by quality and criteria.",
        "Builds the catalog file (.md).",
        'Opens a draft PR (and, if the app needs code too, its "mirror PR").',
        "Logs the result so it stays on record.",
      ],
    },
  },
];

/**
 * Purely informational accordion below Panel A + Panel B on
 * /admin/integraciones. No fetches, no auth gate, no side effects — just
 * explains in plain language what each loop does and its steps, so JM
 * knows what a supervision run means before clicking "Correr ahora".
 * Renders regardless of auth state (unlike the two panels above).
 */
export function LoopsInfoSection({ lang }: { lang: string }) {
  const isEs = lang !== "en";

  return (
    <section className="mx-auto max-w-3xl px-5 md:px-6 pb-16">
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)]/60 p-6">
        <h2 className="text-[16px] font-semibold tracking-tight text-[var(--color-fg-strong)]">
          {isEs ? "¿Qué hace cada loop?" : "What does each loop do?"}
        </h2>
        <p className="mt-2 inline-flex items-start gap-1.5 text-[12px] text-[var(--color-fg-dim)]">
          <Info size={13} className="mt-[1px] shrink-0" />
          {isEs
            ? "Solo informativo — así sabés qué hace cada supervisión antes de correrla."
            : "Informational only — so you know what each supervision does before running it."}
        </p>

        <div className="mt-4 space-y-2">
          {LOOPS.map((loop) => (
            <LoopAccordionItem key={loop.title.en} loop={loop} isEs={isEs} />
          ))}
        </div>
      </div>
    </section>
  );
}

function LoopAccordionItem({ loop, isEs }: { loop: LoopInfo; isEs: boolean }) {
  const [open, setOpen] = useState(false);
  const lang = isEs ? "es" : "en";

  return (
    <div className="rounded-xl border border-[var(--color-border)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left text-[13.5px] font-medium text-[var(--color-fg-strong)]"
      >
        {open ? (
          <ChevronDown size={14} className="shrink-0 text-[var(--color-fg-muted)]" />
        ) : (
          <ChevronRight size={14} className="shrink-0 text-[var(--color-fg-muted)]" />
        )}
        {loop.title[lang]}
      </button>

      {open ? (
        <div className="px-4 pb-4 pl-9 text-[13px] text-[var(--color-fg-muted)] leading-relaxed">
          <p>
            <span className="font-medium text-[var(--color-fg)]">
              {isEs ? "Qué hace: " : "What it does: "}
            </span>
            {loop.what[lang]}
          </p>
          <p className="mt-3 font-medium text-[var(--color-fg)]">
            {isEs ? "Pasos:" : "Steps:"}
          </p>
          <ol className="mt-1.5 list-decimal space-y-1 pl-5">
            {loop.steps[lang].map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
      ) : null}
    </div>
  );
}
