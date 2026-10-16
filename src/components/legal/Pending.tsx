import { LEGAL_ES_PUBLIC } from "@/lib/launchFlags";
import type { Locale } from "@/content";

/**
 * Marcas de borrador de las páginas legales para España.
 *
 * Solo se pintan mientras `LEGAL_ES_PUBLIC` sea `false`. Con el interruptor
 * encendido no queda ningún marcador en pantalla (y `legalEs.test.ts` impide
 * encenderlo si todavía hay datos pendientes).
 */
const MARK =
  "rounded bg-amber-500/20 px-1.5 py-0.5 font-mono text-[0.85em] text-[var(--color-fg-strong)]";

export function isDraft(): boolean {
  return !LEGAL_ES_PUBLIC;
}

export function Pending({ children }: { children: React.ReactNode }) {
  if (!isDraft()) return null;
  return <mark className={MARK}>[PENDIENTE: {children}]</mark>;
}

export function ToConfirm({ children }: { children: React.ReactNode }) {
  if (!isDraft()) return null;
  return <mark className={MARK}>[A CONFIRMAR POR ABOGADO: {children}]</mark>;
}

export function DraftNotice({ lang }: { lang: Locale }) {
  if (!isDraft()) return null;
  return (
    <aside
      role="note"
      className="mb-8 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-[13.5px] leading-relaxed text-[var(--color-fg)]"
    >
      <strong className="text-[var(--color-fg-strong)]">
        {lang === "es" ? "BORRADOR pendiente de validación por abogado." : "DRAFT pending lawyer validation."}
      </strong>{" "}
      {lang === "es"
        ? "Este texto no es asesoría legal y no está en vigor. Los marcadores [PENDIENTE] y [A CONFIRMAR POR ABOGADO] indican datos o decisiones que faltan; desaparecen al publicarse la versión final."
        : "This text is not legal advice and is not in force. The [PENDIENTE] and [A CONFIRMAR POR ABOGADO] markers flag missing data or decisions; they disappear when the final version is published."}
    </aside>
  );
}
