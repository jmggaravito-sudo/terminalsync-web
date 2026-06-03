import { Globe, LayoutDashboard, DoorOpen, FileText, Image as ImageIcon, Package } from "lucide-react";
import type { Locale } from "@/content";

/**
 * Visible Results — capa de PRUEBA (no pilar). "La IA construye, tú lo ves."
 * Reencuadra "conversación con IA" → "producción con IA". Bilingüe.
 */
const ICONS = [Globe, LayoutDashboard, DoorOpen, FileText, ImageIcon, Package];

const T = {
  es: {
    eyebrow: "Resultados visibles",
    title: "La IA construye. Tú lo ves.",
    subtitle: "No es solo una conversación. Es trabajo real que aparece frente a ti — sin salir de TerminalSync.",
    closing: "Esto no es IA que responde. Es IA que produce.",
    labels: ["Sitios web", "Dashboards", "Portales de clientes", "PDFs y documentos", "Imágenes", "Reportes y entregables"],
  },
  en: {
    eyebrow: "Visible results",
    title: "The AI builds. You see it.",
    subtitle: "It's not just a conversation. It's real work that appears in front of you — without leaving TerminalSync.",
    closing: "This isn't AI that answers. It's AI that produces.",
    labels: ["Websites", "Dashboards", "Client portals", "PDFs & documents", "Images", "Reports & deliverables"],
  },
} as const;

export function VisibleResults({ lang }: { lang: Locale }) {
  const t = T[lang];
  return (
    <section id="visible-results" className="mx-auto max-w-5xl px-5 md:px-6 py-20 md:py-24">
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

      <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-4">
        {t.labels.map((label, i) => {
          const Icon = ICONS[i];
          return (
            <div
              key={label}
              className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-8 text-center transition-colors hover:border-[var(--color-accent)]/40"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                <Icon size={20} strokeWidth={2} />
              </span>
              <span className="text-[14px] font-medium text-[var(--color-fg)]">{label}</span>
            </div>
          );
        })}
      </div>

      <p className="mt-8 text-center text-[15px] font-semibold text-[var(--color-fg-strong)]">{t.closing}</p>
    </section>
  );
}
