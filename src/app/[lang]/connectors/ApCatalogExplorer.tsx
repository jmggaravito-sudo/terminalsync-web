"use client";

import { useEffect, useMemo, useState } from "react";

type ApPiece = {
  name: string;
  pkg: string;
  logo: string;
  description: { es: string; en: string };
  soon?: boolean;
};

type Snapshot = { total: number; pieces: ApPiece[] };

/**
 * Catálogo completo de integraciones (Activepieces + first-party dedupe) del
 * snapshot público /data/ap-catalog.json — el mismo que consume el marquee y
 * el buscador del landing (landing-b). Búsqueda client-side, sin backend.
 */
export function ApCatalogExplorer({ lang }: { lang: string }) {
  const [data, setData] = useState<Snapshot | null>(null);
  const [q, setQ] = useState("");
  const es = lang === "es";

  useEffect(() => {
    let alive = true;
    fetch("/data/ap-catalog.json")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: Snapshot) => {
        if (alive) setData(d);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const norm = (s: string) => (s ?? "").toLowerCase();
  const hits = useMemo(() => {
    if (!data || !q.trim()) return [];
    const query = norm(q.trim());
    return data.pieces
      .filter(
        (p) =>
          norm(p.name).includes(query) ||
          norm(p.description.es).includes(query) ||
          norm(p.description.en).includes(query),
      )
      .slice(0, 24);
  }, [data, q]);

  return (
    <section className="mx-auto max-w-5xl px-6 pb-24">
      <div className="mt-14 pt-10 border-t border-[var(--color-border)]">
        <h2 className="text-[24px] md:text-[30px] font-semibold tracking-tight leading-tight">
          {data
            ? es
              ? `${data.total} integraciones más, listas para conectar`
              : `${data.total} more integrations, ready to connect`
            : es
              ? "Integraciones"
              : "Integrations"}
        </h2>
        <p className="mt-2 text-[15px] text-[var(--color-fg-muted)] max-w-2xl leading-relaxed">
          {es
            ? "Automatizaciones conversacionales: le pides a la IA «cuando me llegue un correo de proveedor, mándalo a Sheets» y el flujo queda construido y verificado."
            : "Conversational automations: ask the AI “when a supplier email arrives, send it to Sheets” and the flow is built and verified."}
        </p>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={
            es
              ? "Busca tu integración: Slack, QuickBooks, Notion…"
              : "Find your integration: Slack, QuickBooks, Notion…"
          }
          aria-label={es ? "Buscar integración" : "Search integration"}
          className="mt-5 w-full max-w-xl rounded-full border border-[var(--color-border)] bg-[var(--color-panel-2)] px-5 py-3 text-[14px] outline-none focus:border-[var(--color-accent)]"
        />
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {hits.map((p) => (
            <div
              key={p.pkg}
              title={p.name}
              className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-panel-2)] px-3 py-2.5 min-w-0"
            >
              <img
                src={p.logo}
                alt=""
                width={28}
                height={28}
                loading="lazy"
                className="rounded-md bg-white p-0.5 shrink-0"
              />
              <div className="min-w-0">
                <div className="text-[13px] font-semibold truncate">{p.name}</div>
                {p.soon ? (
                  <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-fg-muted)]">
                    {es ? "Pronto" : "Soon"}
                  </span>
                ) : (
                  <div className="text-[11px] text-[var(--color-fg-muted)] truncate">
                    {es ? p.description.es : p.description.en}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        {data && q.trim() && hits.length === 0 ? (
          <p className="mt-4 text-[13px] text-[var(--color-fg-muted)]">
            {es
              ? "No está en el catálogo hoy — cuéntanos cuál necesitas y la evaluamos."
              : "Not in the catalog today — tell us which one you need and we'll evaluate it."}
          </p>
        ) : null}
        {data && !q.trim() ? (
          <p className="mt-4 text-[13px] text-[var(--color-fg-muted)]">
            {es
              ? "Escribe para buscar entre todas."
              : "Type to search them all."}
          </p>
        ) : null}
      </div>
    </section>
  );
}
