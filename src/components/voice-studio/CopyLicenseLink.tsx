"use client";

import { useState } from "react";

// Copy-to-clipboard for the lead's license signing link (minted server-side
// during page render — no extra endpoint, nothing exposed beyond the page).
export function CopyLicenseLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (http context) — select fallback: open it.
      window.open(url, "_blank");
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-lg border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-700 transition-colors hover:border-zinc-500"
    >
      {copied ? "Copied ✓" : "Copy license link"}
    </button>
  );
}
