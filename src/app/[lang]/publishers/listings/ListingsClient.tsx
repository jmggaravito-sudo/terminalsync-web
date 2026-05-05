"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { authedFetch } from "@/lib/supabase/browser";

interface Listing {
  id: string;
  slug: string;
  name: string;
  status: "draft" | "pending" | "approved" | "rejected";
  pricing_type: "free" | "one_time";
  price_cents: number | null;
  install_count: number;
  rating_avg: number | null;
}

const STATUS_COLOR: Record<Listing["status"], string> = {
  draft: "bg-zinc-500/10 text-zinc-500 border-zinc-500/30",
  pending: "bg-amber-500/10 text-amber-500 border-amber-500/30",
  approved: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
  rejected: "bg-red-500/10 text-red-500 border-red-500/30",
};

export function ListingsClient({ lang }: { lang: string }) {
  const isEs = lang === "es";
  const [items, setItems] = useState<Listing[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    authedFetch("/api/marketplace/listings?status=mine")
      .then((r) => r.json().then((d) => ({ ok: r.ok, data: d })))
      .then(({ ok, data }) => {
        if (cancelled) return;
        if (!ok) {
          setError(data.error ?? "Error fetching listings");
          return;
        }
        setItems(data.listings ?? []);
      })
      .catch((e) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return <p className="text-[13px] text-red-500">{error}</p>;
  }
  if (items === null) {
    return <p className="text-[13px] text-[var(--color-fg-muted)]">{isEs ? "Cargando…" : "Loading…"}</p>;
  }
  if (items.length === 0) {
    return (
      <p className="text-[13px] text-[var(--color-fg-muted)]">
        {isEs ? "Aún no tenés listings. Empezá con uno nuevo." : "No listings yet. Start a new one."}
      </p>
    );
  }
  return (
    <ul className="space-y-3">
      {items.map((l) => (
        <li
          key={l.id}
          className="flex items-center gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Link
                href={`/${lang}/connectors/${l.slug}`}
                className="text-[15px] font-semibold tracking-tight truncate hover:text-[var(--color-accent)]"
              >
                {l.name}
              </Link>
              <span className={`text-[10px] font-mono uppercase tracking-[0.12em] border rounded px-1.5 py-0.5 ${STATUS_COLOR[l.status]}`}>
                {l.status}
              </span>
            </div>
            <p className="mt-1 text-[12px] text-[var(--color-fg-muted)] font-mono">
              {l.pricing_type === "free"
                ? "free"
                : `$${((l.price_cents ?? 0) / 100).toFixed(2)}`}
              {" · "}
              {l.install_count} {isEs ? "instalaciones" : "installs"}
              {l.rating_avg !== null && ` · ★ ${l.rating_avg.toFixed(1)}`}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
