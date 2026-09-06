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
      es: "Supervisión app: Conectores 4 IAs",
      en: "App supervision: 4-AI connectors",
    },
    what: {
      es: "Corre connector-loop.yml en terminal-sync y verifica que los Conectores lleguen parejo a Claude, Codex, Gemini y GLM dentro de la app.",
      en: "Runs connector-loop.yml in terminal-sync and verifies connector parity across Claude, Codex, Gemini and GLM inside the app.",
    },
    steps: {
      es: [
        "Dispara el workflow del repo de la app.",
        "Revisa paridad por IA.",
        "Deja el run de GitHub como evidencia.",
      ],
      en: [
        "Dispatches the app repo workflow.",
        "Checks parity per AI.",
        "Leaves the GitHub run as evidence.",
      ],
    },
  },
  {
    title: {
      es: "Supervisión marketplace → app",
      en: "Marketplace → app supervision",
    },
    what: {
      es: "Corre integration-supervision-loop.yml en terminalsync-web: revisa catálogo servido, paridad ES/EN y consumo desde la app.",
      en: "Runs integration-supervision-loop.yml in terminalsync-web: checks served catalog, ES/EN parity and app consumption.",
    },
    steps: {
      es: [
        "Lee el catálogo web publicado.",
        "Cruza que la app pueda consumir lo mismo.",
        "Marca faltantes antes de publicar cambios grandes.",
      ],
      en: [
        "Reads the published web catalog.",
        "Checks that the app can consume the same catalog.",
        "Flags gaps before big publishing changes.",
      ],
    },
  },
  {
    title: {
      es: "Curación de Conectores, Plugins, Skills y Kits",
      en: "Connector, Plugin, Skill and Kit curation",
    },
    what: {
      es: "Son los loops que descubren candidatos por tipo, los evalúan y abren PRs draft para revisión. No publican nada solos.",
      en: "These loops discover candidates by type, evaluate them and open draft PRs for review. Nothing goes live by itself.",
    },
    steps: {
      es: [
        "Buscan fuentes y candidatos.",
        "Filtran por calidad y criterios.",
        "Arma el archivo de catálogo (.md).",
        "Abren un PR draft.",
        "Anotan el resultado para que quede registrado.",
      ],
      en: [
        "Look for sources and candidates.",
        "Filter by quality and criteria.",
        "Builds the catalog file (.md).",
        "Open a draft PR.",
        "Log the result so it stays on record.",
      ],
    },
  },
  {
    title: {
      es: "Herramientas CLI",
      en: "CLI tools",
    },
    what: {
      es: "Hoy se pueden agregar candidatos de Herramientas CLI por formulario. El loop automático queda visible como pendiente hasta crear cli-curation-loop.yml.",
      en: "CLI tool candidates can be added through the form today. The automatic loop stays visible as pending until cli-curation-loop.yml exists.",
    },
    steps: {
      es: [
        "Creás el candidato CLI en el panel.",
        "El PR queda oculto/pendiente hasta revisión.",
        "Cuando exista el workflow CLI, el botón de curación se podrá correr desde el mismo panel.",
      ],
      en: [
        "Create the CLI candidate in the panel.",
        "The PR stays hidden/pending until review.",
        "Once the CLI workflow exists, its curation button can run from the same panel.",
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
          <ChevronDown
            size={14}
            className="shrink-0 text-[var(--color-fg-muted)]"
          />
        ) : (
          <ChevronRight
            size={14}
            className="shrink-0 text-[var(--color-fg-muted)]"
          />
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
