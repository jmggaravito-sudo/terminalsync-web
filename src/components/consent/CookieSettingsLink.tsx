"use client";

import { OPEN_SETTINGS_EVENT } from "@/lib/consent";

/**
 * Enlace permanente "Configurar cookies" (pie y política de cookies). Abre el
 * panel del gestor para cambiar o retirar la decisión en cualquier momento.
 */
export function CookieSettingsLink({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      data-cookie-settings
      className={className}
      onClick={() => window.dispatchEvent(new CustomEvent(OPEN_SETTINGS_EVENT))}
    >
      {label}
    </button>
  );
}
