"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import type { Locale } from "@/content";

/**
 * §09 Casos de uso — explícitos, con selector por oficio. Cada uno:
 * Problema → Transformación → Ejemplo de resultado. Bilingüe (ES neutro / EN).
 */
type Segment = { key: string; tab: string; problem: string; transformation: string; outputs: string[] };

const T: Record<Locale, { eyebrow: string; title: string; subtitle: string; kProblem: string; kTransform: string; kBuild: string; cta: string; segments: Segment[] }> = {
  es: {
    eyebrow: "Casos de uso",
    title: "Hecho para tu negocio, sea cual sea.",
    subtitle: "Esto es exactamente lo que alguien como tú construye.",
    kProblem: "El problema",
    kTransform: "La transformación",
    kBuild: "Lo que construye",
    cta: "Empieza gratis",
    segments: [
      { key: "brokers", tab: "Brokers", problem: "Los leads y los seguimientos se escapan; los negocios se enfrían.", transformation: "Nunca pierdas un negocio por un seguimiento olvidado.", outputs: ["“Recuérdame a quién llamar hoy”", "“Redacta seguimientos cálidos en mi voz”", "“Muéstrame el estado de cada negocio de un vistazo”"] },
      { key: "consultores", tab: "Consultores", problem: "La comunicación con clientes, las propuestas y los entregables se acumulan.", transformation: "Quedas por encima de cada cliente, sin esfuerzo.", outputs: ["“Convierte esta llamada en una propuesta”", "“No me dejes perder ningún check-in con un cliente”", "“Un portal donde cada cliente entra”"] },
      { key: "agencias", tab: "Agencias", problem: "Muchas cuentas, estado disperso, reportes manuales.", transformation: "Maneja más cuentas sin sumar gente.", outputs: ["“Una sola vista de todas las cuentas”", "“Arma el reporte semanal del cliente solo”", "“Recibe pedidos sin el caos del correo”"] },
      { key: "ecommerce", tab: "Ecommerce", problem: "Pedidos, preguntas, recompras y reseñas te desbordan.", transformation: "Más ventas, menos trabajo repetitivo.", outputs: ["“Responde las mismas preguntas automáticamente”", "“Señala a quién conviene recuperar”", "“Un dashboard de lo que realmente se vende”"] },
      { key: "fundadores", tab: "Fundadores", problem: "Más ideas que tiempo para ejecutarlas.", transformation: "Lanza la idea esta semana, no el otro trimestre.", outputs: ["“Construye la herramienta interna que vengo posponiendo”", "“Automatiza eso manual que me come la semana”", "“Un sistema de operaciones simple para mi equipo”"] },
    ],
  },
  en: {
    eyebrow: "Use cases",
    title: "Built for your business, whatever it is.",
    subtitle: "Here's exactly what someone like you builds.",
    kProblem: "The problem",
    kTransform: "The transformation",
    kBuild: "What they build",
    cta: "Start free",
    segments: [
      { key: "brokers", tab: "Brokers", problem: "Leads and follow-ups slip through; deals go cold.", transformation: "Never lose a deal to a missed follow-up.", outputs: ["“Remind me who to call back today”", "“Draft warm follow-ups in my voice”", "“Show me every deal's status at a glance”"] },
      { key: "consultants", tab: "Consultants", problem: "Client comms, proposals and deliverables pile up.", transformation: "Stay on top of every client, effortlessly.", outputs: ["“Turn this call into a proposal”", "“Don't let me miss a client check-in”", "“A portal each client can log into”"] },
      { key: "agencies", tab: "Agencies", problem: "Many accounts, scattered status, manual reporting.", transformation: "Run more accounts without adding headcount.", outputs: ["“One view of every account”", "“Build the weekly client report on its own”", "“Take in requests without email chaos”"] },
      { key: "ecommerce", tab: "Ecommerce", problem: "Orders, questions, reorders and reviews overwhelm you.", transformation: "More sales, less busywork.", outputs: ["“Answer the same questions automatically”", "“Flag who's worth winning back”", "“A dashboard of what's actually selling”"] },
      { key: "founders", tab: "Founders", problem: "More ideas than time to execute them.", transformation: "Ship the idea this week, not next quarter.", outputs: ["“Build the internal tool I keep postponing”", "“Automate the manual thing eating my week”", "“A simple ops system for my team”"] },
    ],
  },
};

export function UseCases({ lang }: { lang: Locale }) {
  const t = T[lang];
  const [active, setActive] = useState(0);
  const s = t.segments[active];

  return (
    <section id="use-cases" className="mx-auto max-w-5xl px-5 md:px-6 py-14 md:py-24">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--color-accent)]">
          {t.eyebrow}
        </span>
        <h2
          className="mt-3 font-semibold tracking-tight text-[var(--color-fg-strong)] leading-[1.08]"
          style={{ fontSize: "clamp(1.75rem, 4.5vw, 2.75rem)" }}
        >
          {t.title}
        </h2>
        <p className="mt-4 text-[16px] text-[var(--color-fg-muted)] leading-relaxed">{t.subtitle}</p>
      </div>

      <div className="mt-9 flex flex-wrap items-center justify-center gap-2">
        {t.segments.map((seg, i) => (
          <button
            key={seg.key}
            type="button"
            onClick={() => setActive(i)}
            className={`rounded-full px-4 py-2 text-[13.5px] font-semibold transition-colors ${
              i === active
                ? "bg-[var(--color-accent)] text-white"
                : "border border-[var(--color-border)] bg-[var(--color-panel)] text-[var(--color-fg)] hover:border-[var(--color-accent)]/40"
            }`}
          >
            {seg.tab}
          </button>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Step kicker={t.kProblem} body={s.problem} tone="dim" />
        <Step kicker={t.kTransform} body={s.transformation} tone="ok" />
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
          <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-[var(--color-fg-muted)]">{t.kBuild}</div>
          <ul className="mt-3 flex flex-col gap-2.5">
            {s.outputs.map((o) => (
              <li key={o} className="flex items-start gap-2 text-[13.5px] text-[var(--color-fg)] leading-snug">
                <ArrowRight size={14} strokeWidth={2.2} className="mt-1 shrink-0 text-[var(--color-accent)]" />
                <span>{o}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8 text-center">
        <a
          href="/api/download"
          data-cta="usecases-primary"
          className="inline-flex items-center gap-2 rounded-2xl bg-[var(--color-accent)] px-5 py-3 text-[14px] font-semibold text-white transition-all glow-accent hover:-translate-y-px hover:bg-[var(--color-accent-soft)]"
        >
          {t.cta}
        </a>
      </div>
    </section>
  );
}

function Step({ kicker, body, tone }: { kicker: string; body: string; tone: "dim" | "ok" }) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        tone === "ok" ? "border-[var(--color-ok)]/30 bg-[var(--color-ok)]/6" : "border-[var(--color-border)] bg-[var(--color-panel)]"
      }`}
    >
      <div className={`text-[11px] font-mono uppercase tracking-[0.14em] ${tone === "ok" ? "text-[var(--color-ok)]" : "text-[var(--color-fg-muted)]"}`}>
        {kicker}
      </div>
      <p className="mt-2 text-[15px] font-medium text-[var(--color-fg-strong)] leading-snug">{body}</p>
    </div>
  );
}
