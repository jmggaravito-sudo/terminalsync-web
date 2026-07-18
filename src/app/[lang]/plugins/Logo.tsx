"use client";
import { useState } from "react";
import { initialsFrom } from "@/components/marketplace/initialsFrom";

/** Displays a plugin logo with an initials fallback (matching SkillLogo /
 *  ConnectorLogo) so a card never collapses into a blank square. */
export function PluginLogo({
  src,
  size = 28,
  className,
  fallbackText,
}: {
  src: string;
  size?: number;
  className?: string;
  fallbackText?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span
        aria-hidden
        className={`inline-flex items-center justify-center rounded-md bg-[var(--color-panel-2)] text-[var(--color-fg-muted)] font-semibold ${className ?? ""}`}
        style={{ width: size, height: size, fontSize: Math.max(10, Math.round(size * 0.42)) }}
      >
        {initialsFrom(fallbackText ?? src)}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" width={size} height={size} className={className} onError={() => setFailed(true)} />
  );
}
