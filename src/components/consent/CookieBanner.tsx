"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { CONSENT_COPY } from "@/components/consent/copy";
import {
  ALL_CONSENT,
  CONSENT_EVENT,
  LEGACY_ACCEPTED_EVENT,
  NO_CONSENT,
  OPEN_SETTINGS_EVENT,
  browserStorage,
  effectiveConsent,
  needsDecision,
  writeConsent,
  type ConsentCategories,
} from "@/lib/consent";
import { browserRegion } from "@/lib/region";

// Los tres botones del banner comparten EXACTAMENTE la misma clase: mismo
// tamaño, color y peso. Rechazar no puede ser menos visible que aceptar.
const BTN =
  "inline-flex flex-1 items-center justify-center h-10 px-4 rounded-full border border-[var(--color-fg-muted)] bg-[var(--color-panel-2)] hover:bg-[var(--color-border)] text-[var(--color-fg-strong)] text-[13px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]";

/**
 * Gestor de cookies propio (sin CMP de terceros). Se monta una sola vez en el
 * layout raíz, así que cubre todas las rutas. La home estática
 * (`/landing-b/index.html`) usa `public/consent.js`, que habla el mismo formato.
 *
 * - Sin decisión vigente: banner con "Aceptar todas", "Rechazar todas" y
 *   "Configurar" (iguales). No bloquea la página.
 * - "Configurar" (o el enlace del pie, vía OPEN_SETTINGS_EVENT) abre el panel
 *   por categorías, que sirve también para cambiar o retirar la decisión.
 */
export function CookieBanner() {
  const pathname = usePathname() ?? "";
  const lang = pathname.startsWith("/en") ? "en" : "es";
  const t = CONSENT_COPY[lang];

  const [mode, setMode] = useState<"hidden" | "banner" | "panel">("hidden");
  const [draft, setDraft] = useState<ConsentCategories>(NO_CONSENT);

  useEffect(() => {
    const storage = browserStorage();
    // Banner estricto SOLO en Europa (y ante la duda: fail-safe = Europa).
    // Fuera de Europa no hay banner; el panel sigue abierto desde el pie.
    // Sin almacenamiento (modo privado) en Europa también preguntamos.
    if (browserRegion() === "eu" && (!storage || needsDecision(storage))) setMode("banner");
    const open = () => {
      setDraft(effectiveConsent(browserStorage()));
      setMode("panel");
    };
    window.addEventListener(OPEN_SETTINGS_EVENT, open);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, open);
  }, []);

  function decide(categories: ConsentCategories) {
    writeConsent(browserStorage(), categories);
    setMode("hidden");
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: categories }));
    // Compatibilidad: quien escuchaba el evento antiguo (Rewardful) lo sigue recibiendo.
    if (categories.affiliates) window.dispatchEvent(new CustomEvent(LEGACY_ACCEPTED_EVENT));
  }

  if (mode === "hidden") return null;

  const toggle = (key: keyof ConsentCategories) =>
    setDraft((d) => ({ ...d, [key]: !d[key] }));

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-banner-title"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-[460px] z-50 rounded-2xl bg-[var(--color-panel)] border border-[var(--color-border)] shadow-2xl p-5"
    >
      {mode === "banner" ? (
        <>
          <h2 id="cookie-banner-title" className="text-[14px] font-semibold text-[var(--color-fg-strong)] mb-1.5">
            {t.title}
          </h2>
          <p className="text-[12.5px] text-[var(--color-fg-muted)] leading-relaxed">
            {t.body}{" "}
            <a
              href={t.policyHref}
              className="text-[var(--color-accent)] hover:text-[var(--color-accent-soft)] underline underline-offset-2"
            >
              {t.policy}
            </a>
            .
          </p>
          <div className="mt-4 flex items-center gap-2">
            <button type="button" className={BTN} onClick={() => decide(ALL_CONSENT)}>
              {t.accept}
            </button>
            <button type="button" className={BTN} onClick={() => decide(NO_CONSENT)}>
              {t.reject}
            </button>
            <button
              type="button"
              className={BTN}
              onClick={() => {
                setDraft(NO_CONSENT);
                setMode("panel");
              }}
            >
              {t.configure}
            </button>
          </div>
        </>
      ) : (
        <>
          <h2 id="cookie-banner-title" className="text-[14px] font-semibold text-[var(--color-fg-strong)] mb-3">
            {t.panelTitle}
          </h2>
          <div className="space-y-3">
            <Row title={t.necessaryTitle} body={t.necessaryBody}>
              <span className="text-[12px] font-semibold text-[var(--color-fg-muted)]">{t.alwaysOn}</span>
            </Row>
            <Row title={t.analyticsTitle} body={t.analyticsBody}>
              <Switch
                label={t.analyticsTitle}
                checked={draft.analytics}
                onChange={() => toggle("analytics")}
              />
            </Row>
            <Row title={t.affiliatesTitle} body={t.affiliatesBody}>
              <Switch
                label={t.affiliatesTitle}
                checked={draft.affiliates}
                onChange={() => toggle("affiliates")}
              />
            </Row>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <button type="button" className={BTN} onClick={() => decide(ALL_CONSENT)}>
              {t.accept}
            </button>
            <button type="button" className={BTN} onClick={() => decide(NO_CONSENT)}>
              {t.reject}
            </button>
            <button type="button" className={BTN} onClick={() => decide(draft)}>
              {t.save}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function Row({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-[var(--color-fg-strong)]">{title}</p>
        <p className="text-[12px] text-[var(--color-fg-muted)] leading-relaxed">{body}</p>
      </div>
      <div className="flex-shrink-0 pt-0.5">{children}</div>
    </div>
  );
}

function Switch({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative h-6 w-11 rounded-full border border-[var(--color-fg-muted)] transition-colors ${
        checked ? "bg-[var(--color-accent)]" : "bg-[var(--color-panel-2)]"
      }`}
    >
      <span
        className={`absolute top-0.5 rounded-full bg-white shadow transition-all ${
          checked ? "left-[22px]" : "left-0.5"
        }`}
        style={{ width: 18, height: 18 }}
      />
    </button>
  );
}
