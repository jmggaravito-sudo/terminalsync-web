"use client";

import { useState } from "react";
import { Chrome, Copy, Check } from "lucide-react";
import type { Dict } from "@/content/types";

interface Props {
  code: string;
  expiresAt: string; // ISO timestamp; for now only the relative copy renders
  copy: NonNullable<NonNullable<Dict["checkout"]["success"]>["extensionLink"]>;
}

/**
 * Client-only card on the Stripe success page. Pure presentational — the
 * code itself is server-minted by the parent server component. We only
 * own the copy-to-clipboard interaction so the parent stays fully
 * server-rendered + cacheable.
 *
 * Visible only when the parent passes a code (i.e. the checkout actually
 * yielded a supabase_user_id and the mint succeeded). Otherwise the
 * parent omits the card.
 */
export function ExtensionLinkCard({ code, copy }: Props) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      // 1.6s ≈ the typical "ah yes it copied" feedback window before the
      // user looks away. We don't lock the button longer than that.
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Older browsers without clipboard API permission — fall back to
      // selection. Rare in 2026 but cheap to handle.
      const sel = window.getSelection();
      const range = document.createRange();
      const el = document.getElementById("ts-ext-link-code");
      if (sel && el) {
        range.selectNodeContents(el);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  };

  return (
    <div className="mt-7 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5 text-left">
      <div className="flex items-center gap-2">
        <Chrome size={16} strokeWidth={2.2} className="text-[var(--color-accent)]" />
        <h2 className="text-[13px] font-semibold text-[var(--color-fg-strong)]">
          {copy.heading}
        </h2>
      </div>
      <p className="mt-1.5 text-[12px] text-[var(--color-fg-muted)] leading-relaxed">
        {copy.lead}
      </p>

      <div className="mt-4 flex items-center gap-3">
        <code
          id="ts-ext-link-code"
          className="flex-1 rounded-xl bg-[var(--color-panel)] border border-[var(--color-border)] px-4 py-3 font-mono text-[20px] tracking-[0.32em] text-center text-[var(--color-fg-strong)] select-all"
        >
          {code}
        </code>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-1.5 rounded-xl px-3 py-3 text-[12px] font-semibold border border-[var(--color-border)] text-[var(--color-fg-strong)] bg-[var(--color-panel)] hover:bg-[var(--color-bg)] transition-colors"
        >
          {copied ? (
            <>
              <Check size={13} strokeWidth={2.4} />
              {copy.copied}
            </>
          ) : (
            <>
              <Copy size={13} strokeWidth={2.4} />
              {copy.copyButton}
            </>
          )}
        </button>
      </div>

      <p className="mt-3 text-[11px] text-[var(--color-fg-muted)] leading-relaxed">
        {copy.copyHint}
      </p>
      <p className="mt-1.5 text-[11px] text-[var(--color-fg-dim)]">
        {copy.expiresIn}
      </p>
      <p className="mt-3 text-[10.5px] text-[var(--color-fg-dim)] italic">
        {copy.skipHint}
      </p>
    </div>
  );
}
