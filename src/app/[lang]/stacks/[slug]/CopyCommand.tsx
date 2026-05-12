"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/**
 * Inline copy-to-clipboard for CLI install commands inside a bundle.
 * Renders the command as a `<code>` block with a click target on the
 * right edge — same pattern the /cli-tools detail page uses.
 */
export function CopyCommand({
  command,
  isEs,
}: {
  command: string;
  isEs: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable (insecure context / Safari permission). The
      // command is still visible so the user can copy by hand.
    }
  };
  return (
    <div className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-2)] px-2.5 py-1.5">
      <code className="flex-1 min-w-0 truncate text-[12px] font-mono text-[var(--color-fg)]">
        {command}
      </code>
      <button
        type="button"
        onClick={onCopy}
        title={isEs ? "Copiar comando" : "Copy command"}
        aria-label={isEs ? "Copiar comando" : "Copy command"}
        className="shrink-0 inline-flex items-center justify-center h-6 w-6 rounded-md text-[var(--color-fg-dim)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition-colors"
      >
        {copied ? (
          <Check size={13} className="text-[var(--color-ok)]" strokeWidth={2.4} />
        ) : (
          <Copy size={12} strokeWidth={2.4} />
        )}
      </button>
    </div>
  );
}
