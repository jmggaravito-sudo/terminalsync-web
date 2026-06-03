import { Globe, LayoutDashboard, DoorOpen, FileText, Image as ImageIcon, Package } from "lucide-react";

/**
 * Visible Results — capa de PRUEBA (no es un pilar). Reencuadra la categoría
 * de "conversación con IA" a "producción con IA": la IA construye, y lo ves
 * aparecer sin salir de TerminalSync.
 *
 * Copy ES neutro inline (pre-i18n).
 */

const RESULTS: { icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>; label: string }[] = [
  { icon: Globe, label: "Sitios web" },
  { icon: LayoutDashboard, label: "Dashboards" },
  { icon: DoorOpen, label: "Portales de clientes" },
  { icon: FileText, label: "PDFs y documentos" },
  { icon: ImageIcon, label: "Imágenes" },
  { icon: Package, label: "Reportes y entregables" },
];

export function VisibleResults() {
  return (
    <section id="visible-results" className="mx-auto max-w-5xl px-5 md:px-6 py-20 md:py-24">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--color-accent)]">
          Resultados visibles
        </span>
        <h2
          className="mt-3 font-semibold tracking-tight text-[var(--color-fg-strong)] leading-[1.08]"
          style={{ fontSize: "clamp(1.75rem, 4.5vw, 2.75rem)" }}
        >
          La IA construye. Tú lo ves.
        </h2>
        <p className="mt-4 text-[16px] text-[var(--color-fg-muted)] leading-relaxed">
          No es solo una conversación. Es trabajo real que aparece frente a ti —
          sin salir de TerminalSync.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-4">
        {RESULTS.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-8 text-center transition-colors hover:border-[var(--color-accent)]/40"
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
              <Icon size={20} strokeWidth={2} />
            </span>
            <span className="text-[14px] font-medium text-[var(--color-fg)]">{label}</span>
          </div>
        ))}
      </div>

      <p className="mt-8 text-center text-[15px] font-semibold text-[var(--color-fg-strong)]">
        Esto no es IA que responde. Es IA que produce.
      </p>
    </section>
  );
}
