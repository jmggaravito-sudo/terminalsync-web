"use client";
import { useState } from "react";

/** Displays a connector logo. If the image fails (missing file, blocked
 *  CDN, etc.) we render initials in a tinted box instead of disappearing —
 *  blank rounded squares used to slip through when the auto-promote
 *  pipeline left `logo_url` empty. */
export function ConnectorLogo({
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

function initialsFrom(input: string): string {
  // Strip path/extension, split on common separators, take first letters.
  const base = input.replace(/^.*\//, "").replace(/\.[a-z0-9]+$/i, "");
  const parts = base.split(/[\s_\-.]+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
