"use client";

import { useEffect, useState } from "react";

interface PendingListing {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  category: string;
  pricing_type: "free" | "one_time";
  price_cents: number | null;
  description_md: string;
  setup_md: string;
  logo_url: string;
  publisher_id: string;
  created_at: string;
}

export function AdminReview({ lang }: { lang: string }) {
  const isEs = lang === "es";
  const [items, setItems] = useState<PendingListing[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    setItems(null);
    setError(null);
    fetch("/api/marketplace/listings?status=pending")
      .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (!ok) {
          setError(d.error ?? "Error");
          return;
        }
        setItems(d.listings ?? []);
      })
      .catch((e) => setError(e.message));
  }

  useEffect(load, []);

  async function transition(id: string, action: "approve" | "reject") {
    const notes = action === "reject" ? prompt(isEs ? "Motivo del rechazo?" : "Rejection reason?") ?? "" : "";
    setBusyId(id);
    try {
      const res = await fetch(`/api/marketplace/listings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, notes }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Failed");
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setBusyId(null);
    }
  }

  if (error) return <p className="text-[13px] text-red-500">{error}</p>;
  if (items === null) return <p className="text-[13px] text-[var(--color-fg-muted)]">{isEs ? "Cargando…" : "Loading…"}</p>;
  if (items.length === 0) {
    return <p className="text-[13px] text-[var(--color-fg-muted)]">{isEs ? "Sin listings pendientes." : "Queue is empty."}</p>;
  }

  return (
    <ul className="space-y-4">
      {items.map((l) => (
        <li key={l.id} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="text-[16px] font-semibold tracking-tight">{l.name}</h3>
              <p className="mt-1 text-[12px] font-mono text-[var(--color-fg-dim)]">
                {l.category} · {l.pricing_type === "free" ? "free" : `$${((l.price_cents ?? 0) / 100).toFixed(2)}`} · {l.slug}
              </p>
              <p className="mt-2 text-[13px] text-[var(--color-fg-muted)]">{l.tagline}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => transition(l.id, "reject")}
                disabled={busyId === l.id}
                className="rounded-xl px-3 py-1.5 text-[12px] font-semibold border border-red-500/40 text-red-400 hover:bg-red-500/10 disabled:opacity-50"
              >
                {isEs ? "Rechazar" : "Reject"}
              </button>
              <button
                onClick={() => transition(l.id, "approve")}
                disabled={busyId === l.id}
                className="rounded-xl px-3 py-1.5 text-[12px] font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50"
              >
                {isEs ? "Aprobar" : "Approve"}
              </button>
            </div>
          </div>
          <details className="mt-3">
            <summary className="text-[12px] font-mono uppercase tracking-[0.12em] text-[var(--color-fg-muted)] cursor-pointer">
              {isEs ? "Descripción + setup" : "Description + setup"}
            </summary>
            <pre className="mt-3 text-[12px] whitespace-pre-wrap text-[var(--color-fg-muted)] bg-[var(--color-panel-2)] rounded-lg p-3 max-h-80 overflow-auto">{l.description_md}{"\n\n--- setup ---\n\n"}{l.setup_md}</pre>
          </details>
        </li>
      ))}
    </ul>
  );
}
