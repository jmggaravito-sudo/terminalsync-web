"use client";

import { usePathname } from "next/navigation";

// Standalone business landings (e.g. /voice-studio) must stay unlinkable to
// the TerminalSync app: no cookie banner, no "Política de cookies" link, no
// affiliate/analytics loaders. Renders children only outside those paths —
// inert everywhere else in the app.
const STANDALONE_PREFIXES = ["/voice-studio"];

export function HideOnStandalone({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (STANDALONE_PREFIXES.some((p) => pathname.startsWith(p))) return null;
  return <>{children}</>;
}
