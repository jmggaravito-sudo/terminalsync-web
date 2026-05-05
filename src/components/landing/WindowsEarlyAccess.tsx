"use client";

import { useEffect, useState } from "react";
import { Monitor, CheckCircle2, Loader2 } from "lucide-react";
import type { Dict } from "@/content";

type Platform = "windows" | "linux" | "mac" | "other";

/**
 * Detect the visitor's OS. Prefers UA-CH (`navigator.userAgentData`,
 * available in Chromium 90+) and falls back to the legacy userAgent
 * string for Safari + Firefox. Returns "other" when nothing matches —
 * we don't want to misclassify and shame, e.g., a ChromeOS visitor
 * with a Windows banner.
 */
function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "other";
  const uaData = (
    navigator as Navigator & {
      userAgentData?: { platform?: string };
    }
  ).userAgentData;
  const raw = (uaData?.platform ?? navigator.platform ?? navigator.userAgent ?? "")
    .toLowerCase();
  if (raw.includes("win")) return "windows";
  if (raw.includes("mac") || raw.includes("darwin")) return "mac";
  if (raw.includes("linux") && !raw.includes("android")) return "linux";
  return "other";
}

/**
 * Banner that replaces the macOS download CTA when a Windows / Linux
 * visitor lands on the page. Captures their email into the
 * `early_access` table so JM can blast them when the signed installer
 * ships. Renders nothing for Mac visitors so the existing hero CTA
 * stays primary.
 *
 * Placement note: rendered above the hero CTA via conditional in
 * Hero.tsx. The component itself is self-contained — no parent state
 * to wire.
 */
export function WindowsEarlyAccess({ dict }: { dict: Dict }) {
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "ok" | "err">(
    "idle",
  );
  const [errMsg, setErrMsg] = useState<string | null>(null);

  // Run platform detection on mount only — SSR can't see navigator.
  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  // Mac (or unknown) → don't render. The standard download CTA covers it.
  if (platform === null || platform === "mac" || platform === "other") {
    return null;
  }

  const t = dict.windowsEarlyAccess;
  const platformLabel = platform === "windows" ? t.labelWindows : t.labelLinux;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    setStatus("submitting");
    setErrMsg(null);
    try {
      const res = await fetch("/api/early-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          platform,
          locale: dict.locale,
          source: typeof document !== "undefined" ? document.referrer : null,
        }),
      });
      if (!res.ok) {
        const data: { error?: string } = await res.json().catch(() => ({}));
        setStatus("err");
        setErrMsg(data.error ?? "unknown");
        return;
      }
      setStatus("ok");
    } catch {
      setStatus("err");
      setErrMsg("network");
    }
  }

  if (status === "ok") {
    return (
      <div className="mx-auto mt-6 inline-flex max-w-xl items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-left">
        <CheckCircle2
          size={18}
          className="mt-0.5 shrink-0 text-emerald-400"
          strokeWidth={2.2}
        />
        <div>
          <div className="text-[13px] font-semibold text-[var(--color-fg-strong)]">
            {t.successTitle}
          </div>
          <div className="text-[12.5px] text-[var(--color-fg-muted)] leading-relaxed mt-0.5">
            {t.successBody.replace("{platform}", platformLabel)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      data-cta="windows-early-access"
      data-platform={platform}
      className="mx-auto mt-6 max-w-xl rounded-2xl border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/5 px-4 py-4"
    >
      <div className="flex items-start gap-3 text-left">
        <Monitor
          size={18}
          className="mt-0.5 shrink-0 text-[var(--color-accent)]"
          strokeWidth={2.2}
        />
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold text-[var(--color-fg-strong)]">
            {t.title.replace("{platform}", platformLabel)}
          </div>
          <p className="text-[12.5px] text-[var(--color-fg-muted)] leading-relaxed mt-0.5">
            {t.body.replace("{platform}", platformLabel)}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-stretch gap-2 flex-wrap sm:flex-nowrap">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t.emailPlaceholder}
          autoComplete="email"
          disabled={status === "submitting"}
          className="flex-1 min-w-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2 text-[13px] text-[var(--color-fg)] placeholder:text-[var(--color-fg-dim)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/40 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-[13px] font-semibold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] transition-all disabled:opacity-60"
        >
          {status === "submitting" ? (
            <Loader2 size={14} className="animate-spin" />
          ) : null}
          {status === "submitting" ? t.ctaSubmitting : t.cta}
        </button>
      </div>

      {status === "err" && (
        <p className="mt-2 text-[12px] text-rose-400">
          {t.errorPrefix} {errMsg ?? ""}
        </p>
      )}

      <p className="mt-2 text-[11px] text-[var(--color-fg-dim)]">
        {t.privacyNote}
      </p>
    </form>
  );
}
