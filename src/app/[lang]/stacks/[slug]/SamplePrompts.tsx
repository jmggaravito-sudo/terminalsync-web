"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/**
 * Renders the bundle's "Prompts de ejemplo" / "Sample prompts" block.
 *
 * Why this matters: the marketplace target user is NOT a programmer.
 * They don't know what to say to their AI to get value from a freshly-
 * installed bundle. The sample prompts are the on-ramp — copy a prompt,
 * paste it in their Claude/Codex/Cursor chat, see a result, feel that
 * the pack actually does what the description promised.
 *
 * Each prompt renders as a styled <code> block with a one-click copy
 * button on the right. Same visual language as CopyCommand.tsx (used
 * for CLI install commands inside the "what's included" list).
 */
export function SamplePrompts({
  prompts,
  isEs,
}: {
  prompts: string[];
  isEs: boolean;
}) {
  if (prompts.length === 0) return null;
  return (
    <section className="mx-auto max-w-5xl px-6 pb-12">
      <h2 className="text-[14px] font-mono uppercase tracking-[0.16em] text-[var(--color-fg-muted)] mb-3">
        {isEs ? "Prompts de ejemplo" : "Sample prompts"}
      </h2>
      <p className="text-[12.5px] text-[var(--color-fg-muted)] mb-4 max-w-2xl">
        {isEs
          ? "Copiá y pegá cualquiera de estos en tu chat con la IA después de instalar el pack — vas a ver el resultado al instante."
          : "Copy and paste any of these into your AI chat after installing the pack — you'll see the result instantly."}
      </p>
      <ol className="space-y-2">
        {prompts.map((p, i) => (
          <PromptItem key={i} prompt={p} index={i + 1} isEs={isEs} />
        ))}
      </ol>
    </section>
  );
}

function PromptItem({
  prompt,
  index,
  isEs,
}: {
  prompt: string;
  index: number;
  isEs: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable (insecure context / Safari permission).
      // The prompt is still visible so the user can copy by hand.
    }
  };
  return (
    <li className="flex items-start gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-panel-2)] px-3.5 py-2.5">
      <span className="mt-0.5 text-[11px] font-mono text-[var(--color-fg-dim)] tabular-nums shrink-0">
        {String(index).padStart(2, "0")}
      </span>
      <code className="flex-1 min-w-0 text-[13px] font-mono text-[var(--color-fg)] leading-relaxed whitespace-pre-wrap break-words">
        {prompt}
      </code>
      <button
        type="button"
        onClick={onCopy}
        title={isEs ? "Copiar prompt" : "Copy prompt"}
        aria-label={isEs ? "Copiar prompt" : "Copy prompt"}
        className="shrink-0 inline-flex items-center justify-center h-7 w-7 rounded-md text-[var(--color-fg-dim)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition-colors"
      >
        {copied ? (
          <Check size={14} className="text-[var(--color-ok)]" strokeWidth={2.4} />
        ) : (
          <Copy size={14} strokeWidth={2.4} />
        )}
      </button>
    </li>
  );
}
