"use client";
import { useState } from "react";
import { initialsFrom } from "@/components/marketplace/initialsFrom";

/** Renders a CLI tool's vendor logo (Cloudflare, Stripe, etc.). If the
 *  image fails we render initials in a tinted box (matching the
 *  ConnectorLogo / SkillLogo fallback) so the card never collapses into
 *  a blank rounded square. */
export function CliToolLogo({
  src,
  size = 28,
  className,
  fallbackText,
}: {
  src: string;
  size?: number;
  className?: string;
  /** Used to derive initials when the image fails. Defaults to the slug
   *  parsed from `src`. */
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
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
