"use client";

import { useState } from "react";
import { authedFetch } from "@/lib/supabase/browser";

const CATEGORIES = ["productivity", "database", "automation", "storage", "messaging", "dev"] as const;

export function NewListingForm({ lang }: { lang: string }) {
  const isEs = lang === "es";
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [tagline, setTagline] = useState("");
  const [category, setCategory] = useState<typeof CATEGORIES[number]>("productivity");
  const [logoUrl, setLogoUrl] = useState("");
  const [descriptionMd, setDescriptionMd] = useState("");
  const [setupMd, setSetupMd] = useState("");
  const [pricingType, setPricingType] = useState<"free" | "one_time">("free");
  const [priceUsd, setPriceUsd] = useState<string>("9");
  const [manifest, setManifest] = useState<string>(
    JSON.stringify({ command: "npx", args: ["-y", "your-mcp-server"], env: { API_KEY: "${SECRET:YOUR_KEY}" } }, null, 2),
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setDone(null);

    let manifestJson: unknown;
    try {
      manifestJson = JSON.parse(manifest);
    } catch {
      setError(isEs ? "Manifest no es JSON válido" : "Manifest is not valid JSON");
      setSubmitting(false);
      return;
    }

    const priceCents = pricingType === "one_time" ? Math.round(parseFloat(priceUsd) * 100) : undefined;

    try {
      const res = await authedFetch("/api/marketplace/listings", {
        method: "POST",
        body: JSON.stringify({
          listing: {
            slug,
            name,
            tagline,
            category,
            logoUrl,
            descriptionMd,
            setupMd,
            pricingType,
            priceCents,
          },
          manifest: manifestJson,
          version: "1.0.0",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.errors
          ? data.errors.map((e: { field: string; message: string }) => `${e.field}: ${e.message}`).join(" · ")
          : data.error ?? "Submission failed";
        throw new Error(msg);
      }
      setDone(data.listingId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 text-[14px]">
        {isEs
          ? "¡Listo! Tu conector entró como pendiente. Te avisamos por mail cuando lo revisemos (≤48h)."
          : "Submitted! Your connector is pending. We'll email you when reviewed (≤48h)."}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={isEs ? "Nombre" : "Name"}>
          <input required value={name} onChange={(e) => setName(e.target.value)} maxLength={60} className={inputCls} />
        </Field>
        <Field label="Slug" hint={isEs ? "URL única." : "URL-safe."}>
          <input required value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase())} pattern="[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])?" className={inputCls} />
        </Field>
      </div>
      <Field label="Tagline" hint={isEs ? "8–140 caracteres." : "8–140 chars."}>
        <input required value={tagline} onChange={(e) => setTagline(e.target.value)} minLength={8} maxLength={140} className={inputCls} />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={isEs ? "Categoría" : "Category"}>
          <select value={category} onChange={(e) => setCategory(e.target.value as typeof CATEGORIES[number])} className={inputCls}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label={isEs ? "Logo URL (https)" : "Logo URL (https)"}>
          <input required type="url" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://" className={inputCls} />
        </Field>
      </div>
      <Field label={isEs ? "Descripción (Markdown)" : "Description (Markdown)"}>
        <textarea required value={descriptionMd} onChange={(e) => setDescriptionMd(e.target.value)} minLength={40} maxLength={8000} rows={6} className={inputCls} />
      </Field>
      <Field label={isEs ? "Setup (Markdown)" : "Setup (Markdown)"}>
        <textarea required value={setupMd} onChange={(e) => setSetupMd(e.target.value)} minLength={20} maxLength={8000} rows={5} className={inputCls} />
      </Field>
      <Field label={isEs ? "Manifest MCP (JSON)" : "MCP manifest (JSON)"} hint={isEs ? "Usá ${SECRET:NAME} para variables sensibles." : "Use ${SECRET:NAME} for sensitive vars."}>
        <textarea required value={manifest} onChange={(e) => setManifest(e.target.value)} rows={8} className={`${inputCls} font-mono text-[12px]`} />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_180px] gap-4">
        <Field label={isEs ? "Precio" : "Pricing"}>
          <select value={pricingType} onChange={(e) => setPricingType(e.target.value as "free" | "one_time")} className={inputCls}>
            <option value="free">{isEs ? "Gratis" : "Free"}</option>
            <option value="one_time">{isEs ? "Pago único" : "One-time"}</option>
          </select>
        </Field>
        {pricingType === "one_time" && (
          <Field label="USD" hint="$5–$29">
            <input type="number" min={5} max={29} step={1} value={priceUsd} onChange={(e) => setPriceUsd(e.target.value)} className={inputCls} />
          </Field>
        )}
      </div>
      {error && <p className="text-[13px] text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-[13px] font-semibold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] glow-accent transition-all hover:-translate-y-px disabled:opacity-50"
      >
        {submitting ? (isEs ? "Enviando…" : "Submitting…") : (isEs ? "Enviar a revisión" : "Submit for review")}
      </button>
    </form>
  );
}

const inputCls =
  "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2 text-[14px] focus:outline-none focus:border-[var(--color-accent)]";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[12px] font-mono uppercase tracking-[0.12em] text-[var(--color-fg-muted)]">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="mt-1 text-[11.5px] text-[var(--color-fg-dim)]">{hint}</p>}
    </label>
  );
}
